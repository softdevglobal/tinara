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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PaymentMethod = 
  | "cash" 
  | "card" 
  | "bank_transfer" 
  | "eftpos" 
  | "cheque" 
  | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  eftpos: "EFTPOS",
  cheque: "Cheque",
  other: "Other",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  bank_transfer: Building2,
  eftpos: Wallet,
  cheque: Receipt,
  other: Check,
};

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  invoiceAmount: string;
  onConfirm: (paymentMethod: PaymentMethod, reference?: string) => void;
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  invoiceNumber,
  invoiceAmount,
  onConfirm,
}: MarkAsPaidDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");

  const handleConfirm = () => {
    onConfirm(selectedMethod, reference || undefined);
    setSelectedMethod("bank_transfer");
    setReference("");
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
          <DialogTitle>Mark Invoice #{invoiceNumber} as Paid</DialogTitle>
          <DialogDescription>
            Recording payment of {invoiceAmount}. Select how the payment was received.
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

          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Transaction ID (optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., TXN-123456"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-2" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper component to display payment method badge
 */
interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  reference?: string;
  className?: string;
  showIcon?: boolean;
}

export function PaymentMethodBadge({ 
  method, 
  reference, 
  className,
  showIcon = true 
}: PaymentMethodBadgeProps) {
  const Icon = PAYMENT_METHOD_ICONS[method];
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {showIcon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className="text-xs text-muted-foreground">
        {PAYMENT_METHOD_LABELS[method]}
        {reference && (
          <span className="ml-1 font-mono text-[10px]">({reference})</span>
        )}
      </span>
    </div>
  );
}
