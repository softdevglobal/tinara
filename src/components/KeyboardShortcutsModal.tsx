import { useEffect, useCallback } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
  {
    category: "Invoices & Quotes",
    items: [
      { keys: ["⌘", "N"], description: "Create new invoice/quote" },
      { keys: ["⌘", "A"], description: "Toggle select mode" },
      { keys: ["⌘", "K"], description: "Focus search" },
    ],
  },
];

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <span key={index}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded border border-border">
                            {key}
                          </kbd>
                          {index < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            On Windows/Linux, use Ctrl instead of ⌘
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcutsModal() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return false;
    }

    // Check for '?' key (Shift + /)
    if (event.key === "?" || (event.shiftKey && event.key === "/")) {
      event.preventDefault();
      return true;
    }

    return false;
  }, []);

  return { handleKeyDown };
}
