import { useEffect, useCallback } from "react";

export interface KeyboardShortcutActions {
  onNewItem?: () => void;
  onToggleSelectMode?: () => void;
  onFocusSearch?: () => void;
}

export function useKeyboardShortcuts(
  actions: KeyboardShortcutActions,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape to work in inputs
        if (event.key !== "Escape") {
          return;
        }
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + N: New item
      if (modKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        actions.onNewItem?.();
        return;
      }

      // Ctrl/Cmd + A: Toggle select mode (only when not in input)
      if (modKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        actions.onToggleSelectMode?.();
        return;
      }

      // Ctrl/Cmd + K: Focus search
      if (modKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        actions.onFocusSearch?.();
        return;
      }
    },
    [actions, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
