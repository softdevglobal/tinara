import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DocumentType, ClientSnapshot } from "@/types/document";

interface DocumentSendTabProps {
  type: DocumentType;
  documentNumber: string;
  clientSnapshot?: ClientSnapshot;
  total: number;
  currency: string;
  onSend: (data: SendData) => void;
}

interface SendData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachPdf: boolean;
  includePaymentLink: boolean;
}

export function DocumentSendTab({
  type,
  documentNumber,
  clientSnapshot,
  total,
  currency,
  onSend,
}: DocumentSendTabProps) {
  const typeLabel = type === "invoice" ? "Invoice" : "Estimate";
  const clientName = clientSnapshot?.company || clientSnapshot?.name || "Client";

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [to, setTo] = useState(clientSnapshot?.email || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(
    `${typeLabel} #${documentNumber || "NEW"} from Your Business`
  );
  const [body, setBody] = useState(
    type === "invoice"
      ? `Hi ${clientName},

Please find attached your invoice for the amount of ${formatCurrency(total, currency)}.

Payment is due as per the terms on the invoice. You can pay securely online using the payment link below.

Thank you for your business!

Best regards`
      : `Hi ${clientName},

Thank you for your interest in our services. Please find attached our estimate for your review.

If you have any questions or would like to proceed, please don't hesitate to get in touch.

We look forward to working with you!

Best regards`
  );
  const [attachPdf, setAttachPdf] = useState(true);
  const [includePaymentLink, setIncludePaymentLink] = useState(type === "invoice");

  const handleSend = () => {
    onSend({
      to,
      cc,
      bcc,
      subject,
      body,
      attachPdf,
      includePaymentLink,
    });
  };

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-6 space-y-4">
        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Label className="w-16 text-muted-foreground">To</Label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@email.com"
              className="flex-1"
            />
            <div className="flex gap-2">
              {!showCc && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowCc(true)}
                  className="px-2"
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowBcc(true)}
                  className="px-2"
                >
                  Bcc
                </Button>
              )}
            </div>
          </div>

          {showCc && (
            <div className="flex items-center gap-4">
              <Label className="w-16 text-muted-foreground">Cc</Label>
              <Input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@email.com"
                className="flex-1"
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-4">
              <Label className="w-16 text-muted-foreground">Bcc</Label>
              <Input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@email.com"
                className="flex-1"
              />
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-4">
          <Label className="w-16 text-muted-foreground">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Body */}
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[200px]"
          placeholder="Write your message..."
        />

        {/* Options */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Switch
              id="attach-pdf"
              checked={attachPdf}
              onCheckedChange={setAttachPdf}
            />
            <Label htmlFor="attach-pdf" className="text-sm cursor-pointer">
              <Paperclip className="inline h-4 w-4 mr-1" />
              Attach PDF
            </Label>
          </div>

          {type === "invoice" && (
            <div className="flex items-center gap-2">
              <Switch
                id="payment-link"
                checked={includePaymentLink}
                onCheckedChange={setIncludePaymentLink}
              />
              <Label htmlFor="payment-link" className="text-sm cursor-pointer">
                Include payment link
              </Label>
            </div>
          )}
        </div>

        {/* Payment methods preview */}
        {type === "invoice" && includePaymentLink && (
          <div className="flex items-center justify-center gap-2 py-4 bg-muted/50 rounded-lg text-muted-foreground text-sm">
            <span>Payment methods:</span>
            <span className="px-2 py-1 bg-card rounded text-xs font-medium">VISA</span>
            <span className="px-2 py-1 bg-card rounded text-xs font-medium">MC</span>
            <span className="px-2 py-1 bg-card rounded text-xs font-medium">AMEX</span>
            <span className="px-2 py-1 bg-card rounded text-xs font-medium">Apple Pay</span>
          </div>
        )}

        {/* Send button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSend} disabled={!to}>
            <Send className="h-4 w-4 mr-2" />
            Send {typeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency || "AUD",
  }).format(amount);
}
