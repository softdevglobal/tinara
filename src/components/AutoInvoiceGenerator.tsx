import { useApp } from "@/context/AppContext";
import { useAutoGenerateInvoices } from "@/hooks/useAutoGenerateInvoices";

export function AutoInvoiceGenerator() {
  const { recurringInvoices, setRecurringInvoices, setInvoices } = useApp();

  useAutoGenerateInvoices({
    recurringInvoices,
    setRecurringInvoices,
    setInvoices,
  });

  return null;
}
