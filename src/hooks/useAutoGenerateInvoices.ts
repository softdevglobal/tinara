import { useEffect, useRef } from "react";
import { RecurringInvoice, getNextRecurrenceDate } from "@/data/recurring-invoices";
import { Invoice } from "@/data/invoices";
import { useToast } from "@/hooks/use-toast";

interface UseAutoGenerateInvoicesProps {
  recurringInvoices: RecurringInvoice[];
  setRecurringInvoices: React.Dispatch<React.SetStateAction<RecurringInvoice[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

export function useAutoGenerateInvoices({
  recurringInvoices,
  setRecurringInvoices,
  setInvoices,
}: UseAutoGenerateInvoicesProps) {
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasRun.current) return;
    hasRun.current = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueRecurring = recurringInvoices.filter((recurring) => {
      if (!recurring.isActive) return false;

      const nextDue = new Date(recurring.nextDueDate);
      nextDue.setHours(0, 0, 0, 0);

      // Calculate generation date (X days before due date)
      const generateDate = new Date(nextDue);
      generateDate.setDate(generateDate.getDate() - recurring.daysBefore);

      // Check if we should generate (today >= generateDate and not already generated for this cycle)
      const lastGenerated = recurring.lastGeneratedAt
        ? new Date(recurring.lastGeneratedAt)
        : null;

      if (lastGenerated) {
        lastGenerated.setHours(0, 0, 0, 0);
        // Skip if already generated after the previous cycle's due date
        const prevDueDate = new Date(recurring.nextDueDate);
        switch (recurring.frequency) {
          case "weekly":
            prevDueDate.setDate(prevDueDate.getDate() - 7);
            break;
          case "monthly":
            prevDueDate.setMonth(prevDueDate.getMonth() - 1);
            break;
          case "quarterly":
            prevDueDate.setMonth(prevDueDate.getMonth() - 3);
            break;
        }
        if (lastGenerated >= prevDueDate) return false;
      }

      return today >= generateDate;
    });

    if (dueRecurring.length === 0) return;

    const newInvoices: Invoice[] = [];
    const updatedRecurringIds: string[] = [];

    dueRecurring.forEach((recurring) => {
      const subtotal = recurring.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = subtotal * (recurring.taxRate / 100);
      const total = subtotal + taxAmount;

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        number: `A${Date.now().toString().slice(-8)}`,
        clientName: recurring.clientName,
        projectName: recurring.projectName || "",
        date: new Date().toISOString().split("T")[0],
        dueDate: recurring.nextDueDate,
        dueDaysOverdue: 0,
        dueLabel: `Due ${new Date(recurring.nextDueDate).toLocaleDateString()}`,
        status: "Opened",
        total,
        currency: recurring.currency,
      };

      newInvoices.push(newInvoice);
      updatedRecurringIds.push(recurring.id);
    });

    // Add new invoices
    setInvoices((prev) => [...newInvoices, ...prev]);

    // Update recurring invoices with new next due dates
    setRecurringInvoices((prev) =>
      prev.map((r) => {
        if (!updatedRecurringIds.includes(r.id)) return r;
        return {
          ...r,
          lastGeneratedAt: new Date().toISOString().split("T")[0],
          nextDueDate: getNextRecurrenceDate(r.nextDueDate, r.frequency),
        };
      })
    );

    // Show notification
    toast({
      title: `${newInvoices.length} invoice${newInvoices.length > 1 ? "s" : ""} auto-generated`,
      description: `Recurring invoices due today have been created automatically.`,
    });
  }, [recurringInvoices, setRecurringInvoices, setInvoices, toast]);
}
