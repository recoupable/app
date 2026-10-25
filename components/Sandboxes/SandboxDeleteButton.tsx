"use client";

import { Trash2, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDeleteSandbox from "@/hooks/useDeleteSandbox";

interface SandboxDeleteButtonProps {
  onSuccess: () => void;
}

export default function SandboxDeleteButton({
  onSuccess,
}: SandboxDeleteButtonProps) {
  const { deleteSandbox, isDeleting, readOnly } = useDeleteSandbox();

  const handleDelete = async () => {
    await deleteSandbox();
    toast.success("Sandbox deleted successfully");
    onSuccess();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          disabled={isDeleting || readOnly}
        >
          {isDeleting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sandbox</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the GitHub repo and snapshot. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting || readOnly}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
