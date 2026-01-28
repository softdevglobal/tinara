import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

/**
 * Document Counters Context
 * 
 * Manages sequential numbering for invoices and quotes/estimates.
 * - Invoices: I 98978, I 98979, I 98980...
 * - Quotes/Estimates: E 82385, E 82386, E 82387...
 * 
 * Rules:
 * - Numbers are assigned ONLY on first save/send (not on draft creation)
 * - Deleted drafts don't consume numbers
 * - Voided documents keep their number
 * - Converting quote to invoice generates NEW invoice number
 * - Numbers are NEVER reused
 */

interface DocumentCounters {
  invoicePrefix: string;
  invoiceNextNumber: number;
  quotePrefix: string;
  quoteNextNumber: number;
}

interface DocumentCountersContextValue {
  counters: DocumentCounters;
  
  // Generate the next invoice number and increment counter
  generateInvoiceNumber: () => string;
  
  // Generate the next quote number and increment counter
  generateQuoteNumber: () => string;
  
  // Peek at next number without consuming it (for preview)
  peekNextInvoiceNumber: () => string;
  peekNextQuoteNumber: () => string;
  
  // Check if a number is valid/unique
  isInvoiceNumberValid: (number: string) => boolean;
  isQuoteNumberValid: (number: string) => boolean;
}

const STORAGE_KEY = "document_counters";

const DEFAULT_COUNTERS: DocumentCounters = {
  invoicePrefix: "I",
  invoiceNextNumber: 98978,
  quotePrefix: "E",
  quoteNextNumber: 82385,
};

const DocumentCountersContext = createContext<DocumentCountersContextValue | undefined>(undefined);

// Track all issued numbers to prevent duplicates
const issuedInvoiceNumbers = new Set<string>();
const issuedQuoteNumbers = new Set<string>();

export function DocumentCountersProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<DocumentCounters>(() => {
    // Load from localStorage on init
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          console.warn("Failed to parse document counters from localStorage");
        }
      }
    }
    return DEFAULT_COUNTERS;
  });

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
    }
  }, [counters]);

  /**
   * Format a document number with prefix and spacing
   * E.g., "I", 98978 -> "I 98978"
   */
  const formatNumber = (prefix: string, number: number): string => {
    return `${prefix} ${number}`;
  };

  /**
   * Generate the next invoice number and increment the counter
   * This should ONLY be called when actually issuing an invoice (save/send)
   */
  const generateInvoiceNumber = useCallback((): string => {
    const number = formatNumber(counters.invoicePrefix, counters.invoiceNextNumber);
    
    // Mark as issued
    issuedInvoiceNumbers.add(number);
    
    // Increment counter
    setCounters(prev => ({
      ...prev,
      invoiceNextNumber: prev.invoiceNextNumber + 1,
    }));
    
    return number;
  }, [counters.invoicePrefix, counters.invoiceNextNumber]);

  /**
   * Generate the next quote number and increment the counter
   */
  const generateQuoteNumber = useCallback((): string => {
    const number = formatNumber(counters.quotePrefix, counters.quoteNextNumber);
    
    // Mark as issued
    issuedQuoteNumbers.add(number);
    
    // Increment counter
    setCounters(prev => ({
      ...prev,
      quoteNextNumber: prev.quoteNextNumber + 1,
    }));
    
    return number;
  }, [counters.quotePrefix, counters.quoteNextNumber]);

  /**
   * Peek at the next invoice number without consuming it
   * Used for preview display
   */
  const peekNextInvoiceNumber = useCallback((): string => {
    return formatNumber(counters.invoicePrefix, counters.invoiceNextNumber);
  }, [counters.invoicePrefix, counters.invoiceNextNumber]);

  /**
   * Peek at the next quote number without consuming it
   */
  const peekNextQuoteNumber = useCallback((): string => {
    return formatNumber(counters.quotePrefix, counters.quoteNextNumber);
  }, [counters.quotePrefix, counters.quoteNextNumber]);

  /**
   * Check if an invoice number is valid (not already used)
   */
  const isInvoiceNumberValid = useCallback((number: string): boolean => {
    // Must match format: "I XXXXX" or similar
    const pattern = /^[A-Z]\s\d+$/;
    if (!pattern.test(number)) return false;
    
    // Must not be already issued
    return !issuedInvoiceNumbers.has(number);
  }, []);

  /**
   * Check if a quote number is valid (not already used)
   */
  const isQuoteNumberValid = useCallback((number: string): boolean => {
    const pattern = /^[A-Z]\s\d+$/;
    if (!pattern.test(number)) return false;
    return !issuedQuoteNumbers.has(number);
  }, []);

  const value: DocumentCountersContextValue = {
    counters,
    generateInvoiceNumber,
    generateQuoteNumber,
    peekNextInvoiceNumber,
    peekNextQuoteNumber,
    isInvoiceNumberValid,
    isQuoteNumberValid,
  };

  return (
    <DocumentCountersContext.Provider value={value}>
      {children}
    </DocumentCountersContext.Provider>
  );
}

export function useDocumentCounters(): DocumentCountersContextValue {
  const context = useContext(DocumentCountersContext);
  if (context === undefined) {
    throw new Error("useDocumentCounters must be used within DocumentCountersProvider");
  }
  return context;
}
