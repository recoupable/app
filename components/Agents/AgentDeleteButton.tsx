import type React from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAgentTemplateMutation } from "./useAgentTemplateMutation";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";

interface AgentDeleteButtonProps {
  id: string;
  creatorId?: string | null;
}

const AgentDeleteButton: React.FC<AgentDeleteButtonProps> = ({
  id,
  creatorId,
}) => {
  const { userData } = useUserProvider();
  const { authenticated } = usePrivy();
  const isOwner = Boolean(
    authenticated && userData?.account_id && userData.account_id === creatorId,
  );
  const del = useAgentTemplateMutation();

  if (!isOwner) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-xl"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this template?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the agent
            template.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              del.mutate({
                path: `/${encodeURIComponent(id)}`,
                method: "DELETE",
              })
            }
            disabled={del.isPending}
            className="bg-red-500 hover:bg-red-600 rounded-xl"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AgentDeleteButton;
