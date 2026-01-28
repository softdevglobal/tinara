import { useState } from "react";
import { ArrowLeft, Save, Send, Plus, X, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";

const MAX_MESSAGE_LENGTH = 4000;

const CommunicationSettings = () => {
  const { 
    communicationSettings, 
    updateCommunicationSettings, 
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addAuditLog,
  } = useSettings();
  const { toast } = useToast();
  
  const [newCcEmail, setNewCcEmail] = useState("");
  const [newBccEmail, setNewBccEmail] = useState("");

  const handleSave = () => {
    addAuditLog("SETTINGS_UPDATED", "Communication settings updated");
    setHasUnsavedChanges(false);
    toast({
      title: "Settings saved",
      description: "Your communication settings have been updated.",
    });
  };

  const handleSendPreview = () => {
    toast({
      title: "Preview sent",
      description: "A sample email has been sent to your email address.",
    });
  };

  const addCcEmail = () => {
    if (newCcEmail && !communicationSettings.ccEmails.includes(newCcEmail)) {
      updateCommunicationSettings({
        ccEmails: [...communicationSettings.ccEmails, newCcEmail],
      });
      setNewCcEmail("");
    }
  };

  const removeCcEmail = (email: string) => {
    updateCommunicationSettings({
      ccEmails: communicationSettings.ccEmails.filter(e => e !== email),
    });
  };

  const addBccEmail = () => {
    if (newBccEmail && !communicationSettings.bccEmails.includes(newBccEmail)) {
      updateCommunicationSettings({
        bccEmails: [...communicationSettings.bccEmails, newBccEmail],
      });
      setNewBccEmail("");
    }
  };

  const removeBccEmail = (email: string) => {
    updateCommunicationSettings({
      bccEmails: communicationSettings.bccEmails.filter(e => e !== email),
    });
  };

  const messageLength = communicationSettings.defaultMessage.length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Client Communication</h1>
            <p className="text-sm text-muted-foreground">
              Email templates, reminders, and notification settings
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Warning Banner */}
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          Changes apply to <strong>new documents only</strong>. 
          Messages on existing drafts remain unchanged.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Email Message */}
        <Card>
          <CardHeader>
            <CardTitle>Email Message</CardTitle>
            <CardDescription>
              Default message included when sending invoices and quotes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Same message for all document types</Label>
                <p className="text-sm text-muted-foreground">
                  Use one message for invoices, quotes, and reminders
                </p>
              </div>
              <Switch
                checked={communicationSettings.sameMessageForAllTypes}
                onCheckedChange={(checked) => 
                  updateCommunicationSettings({ sameMessageForAllTypes: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Default Message</Label>
                <span className={`text-xs ${messageLength > MAX_MESSAGE_LENGTH * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {messageLength} / {MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <Textarea
                placeholder="Enter your default email message..."
                className="min-h-[120px] resize-none"
                value={communicationSettings.defaultMessage}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                    updateCommunicationSettings({ defaultMessage: e.target.value });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                You can use variables: {"{client_name}"}, {"{document_number}"}, {"{amount_due}"}, {"{due_date}"}
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleSendPreview}>
                <Send className="h-4 w-4 mr-2" />
                Send me a preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CC and BCC */}
        <Card>
          <CardHeader>
            <CardTitle>Copy Recipients</CardTitle>
            <CardDescription>
              Additional recipients for all outgoing emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CC (Carbon Copy)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newCcEmail}
                  onChange={(e) => setNewCcEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCcEmail()}
                />
                <Button type="button" variant="outline" onClick={addCcEmail}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {communicationSettings.ccEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {communicationSettings.ccEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button onClick={() => removeCcEmail(email)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>BCC (Blind Carbon Copy)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newBccEmail}
                  onChange={(e) => setNewBccEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBccEmail()}
                />
                <Button type="button" variant="outline" onClick={addBccEmail}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {communicationSettings.bccEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {communicationSettings.bccEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button onClick={() => removeBccEmail(email)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Reminders</CardTitle>
                <CardDescription>
                  Automatically remind clients about upcoming and overdue invoices
                </CardDescription>
              </div>
              <Switch
                checked={communicationSettings.reminders.enabled}
                onCheckedChange={(checked) => 
                  updateCommunicationSettings({
                    reminders: { ...communicationSettings.reminders, enabled: checked }
                  })
                }
              />
            </div>
          </CardHeader>
          {communicationSettings.reminders.enabled && (
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select when to send payment reminders:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="reminder-before"
                      checked={communicationSettings.reminders.threeDaysBefore}
                      onCheckedChange={(checked) =>
                        updateCommunicationSettings({
                          reminders: { ...communicationSettings.reminders, threeDaysBefore: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="reminder-before" className="font-normal">
                      3 days before due date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="reminder-due"
                      checked={communicationSettings.reminders.onDueDate}
                      onCheckedChange={(checked) =>
                        updateCommunicationSettings({
                          reminders: { ...communicationSettings.reminders, onDueDate: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="reminder-due" className="font-normal">
                      On due date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="reminder-3after"
                      checked={communicationSettings.reminders.threeDaysAfter}
                      onCheckedChange={(checked) =>
                        updateCommunicationSettings({
                          reminders: { ...communicationSettings.reminders, threeDaysAfter: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="reminder-3after" className="font-normal">
                      3 days after due date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="reminder-7after"
                      checked={communicationSettings.reminders.sevenDaysAfter}
                      onCheckedChange={(checked) =>
                        updateCommunicationSettings({
                          reminders: { ...communicationSettings.reminders, sevenDaysAfter: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="reminder-7after" className="font-normal">
                      7 days after due date
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default CommunicationSettings;
