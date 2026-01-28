import { useState } from "react";
import { Calendar, DollarSign, Percent, X, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DepositRequest } from "@/types/document";

interface DepositRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTotal: number;
  currency: string;
  existingDeposit?: DepositRequest;
  onSave: (deposit: DepositRequest) => void;
  onRemove: () => void;
}

export function DepositRequestModal({
  open,
  onOpenChange,
  documentTotal,
  currency,
  existingDeposit,
  onSave,
  onRemove,
}: DepositRequestModalProps) {
  const [depositType, setDepositType] = useState<"percent" | "fixed">(
    existingDeposit?.type || "percent"
  );
  const [depositValue, setDepositValue] = useState(
    existingDeposit?.value || 25
  );
  const [dueDate, setDueDate] = useState<Date>(
    existingDeposit?.dueDate ? new Date(existingDeposit.dueDate) : new Date()
  );
  const [description, setDescription] = useState(
    existingDeposit?.description || ""
  );
  const [stripeEnabled, setStripeEnabled] = useState(
    existingDeposit?.paymentMethods?.stripe ?? true
  );
  const [paypalEnabled, setPaypalEnabled] = useState(
    existingDeposit?.paymentMethods?.paypal ?? false
  );
  const [bankTransferEnabled, setBankTransferEnabled] = useState(
    existingDeposit?.paymentMethods?.bankTransfer ?? true
  );
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Calculate deposit amount
  const depositAmount = depositType === "percent"
    ? (documentTotal * depositValue) / 100
    : depositValue;

  // Validate - deposit cannot exceed total
  const isValid = depositAmount > 0 && depositAmount <= documentTotal;

  const handleSave = () => {
    if (!isValid) return;

    const deposit: DepositRequest = {
      type: depositType,
      value: depositValue,
      dueDate: dueDate.toISOString().split("T")[0],
      amountPaid: existingDeposit?.amountPaid || 0,
      description: description || undefined,
      paymentMethods: {
        stripe: stripeEnabled,
        paypal: paypalEnabled,
        bankTransfer: bankTransferEnabled,
      },
    };

    onSave(deposit);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency || "AUD",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Deposit Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Deposit Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={depositType === "percent" ? "default" : "outline"}
                size="sm"
                onClick={() => setDepositType("percent")}
                className="flex-1"
              >
                <Percent className="h-4 w-4 mr-1" />
                Percentage
              </Button>
              <Button
                type="button"
                variant={depositType === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setDepositType("fixed")}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Fixed Amount
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="depositValue">
              {depositType === "percent" ? "Percentage" : "Amount"}
            </Label>
            <div className="relative">
              <Input
                id="depositValue"
                type="number"
                min={0}
                max={depositType === "percent" ? 100 : documentTotal}
                step={depositType === "percent" ? 1 : 0.01}
                value={depositValue}
                onChange={(e) => setDepositValue(Number(e.target.value))}
                className={cn(
                  "pr-8",
                  !isValid && depositValue > 0 && "border-destructive"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {depositType === "percent" ? "%" : currency}
              </span>
            </div>
            {!isValid && depositValue > 0 && (
              <p className="text-xs text-destructive">
                Deposit cannot exceed the document total ({formatCurrency(documentTotal)})
              </p>
            )}
          </div>

          {/* Calculated Amount */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit Amount</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(depositAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Remaining Balance</span>
              <span className="text-foreground">
                {formatCurrency(documentTotal - depositAmount)}
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., 25% deposit to secure booking"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Payment Methods</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="stripe"
                  checked={stripeEnabled}
                  onCheckedChange={(checked) => setStripeEnabled(!!checked)}
                />
                <label htmlFor="stripe" className="text-sm flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Credit/Debit Card (Stripe)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="paypal"
                  checked={paypalEnabled}
                  onCheckedChange={(checked) => setPaypalEnabled(!!checked)}
                />
                <label htmlFor="paypal" className="text-sm cursor-pointer">
                  PayPal
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bankTransfer"
                  checked={bankTransferEnabled}
                  onCheckedChange={(checked) => setBankTransferEnabled(!!checked)}
                />
                <label htmlFor="bankTransfer" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  Bank Transfer
                </label>
              </div>
            </div>
          </div>

          {/* Save as Default */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="saveDefault"
              checked={saveAsDefault}
              onCheckedChange={(checked) => setSaveAsDefault(!!checked)}
            />
            <label htmlFor="saveDefault" className="text-sm cursor-pointer">
              Save as default for future estimates
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {existingDeposit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
              className="text-destructive hover:text-destructive"
            >
              Remove
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            Save Deposit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
