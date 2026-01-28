import { useState } from "react";
import { CreditCard, Banknote, Building2, Wallet, Receipt, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PaymentMethod, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS } from "./MarkAsPaidDialog";

interface BulkMarkPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceCount: number;
  totalAmount: string;
  onConfirm: (paymentMethod: PaymentMethod) => void;
}

export function BulkMarkPaidDialog({
  open,
  onOpenChange,
  invoiceCount,
  totalAmount,
  onConfirm,
}: BulkMarkPaidDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    setSelectedMethod("bank_transfer");
  };

  const paymentMethods: PaymentMethod[] = [
    "bank_transfer",
    "card",
    "cash",
    "eftpos",
    "cheque",
    "other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark {invoiceCount} Invoice{invoiceCount > 1 ? "s" : ""} as Paid</DialogTitle>
          <DialogDescription>
            Recording payment of {totalAmount} total. Select how the payments were received.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = PAYMENT_METHOD_ICONS[method];
                const isSelected = selectedMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                    <span className="text-sm font-medium">
                      {PAYMENT_METHOD_LABELS[method]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-2" />
            Confirm {invoiceCount} Payment{invoiceCount > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
