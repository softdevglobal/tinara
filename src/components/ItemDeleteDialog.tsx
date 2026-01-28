import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  isReferenced: boolean;
  referenceCount?: number;
  onArchive: () => void;
  onDelete: () => void;
}

export function ItemDeleteDialog({
  open,
  onOpenChange,
  itemName,
  isReferenced,
  referenceCount = 0,
  onArchive,
  onDelete,
}: ItemDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isReferenced ? "Archive Item?" : "Delete Item?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isReferenced ? (
              <>
                <span className="font-medium text-foreground">{itemName}</span> is used in{" "}
                {referenceCount} invoice{referenceCount !== 1 ? "s" : ""} or quote{referenceCount !== 1 ? "s" : ""}.
                <br /><br />
                To preserve document integrity, this item will be <strong>archived</strong> instead of deleted.
                Archived items won't appear when creating new documents, but existing documents will remain unchanged.
              </>
            ) : (
              <>
                Are you sure you want to permanently delete{" "}
                <span className="font-medium text-foreground">{itemName}</span>?
                <br /><br />
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {isReferenced ? (
            <Button onClick={onArchive} variant="secondary">
              <Archive className="h-4 w-4 mr-2" />
              Archive Item
            </Button>
          ) : (
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
