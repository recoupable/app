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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface AgentDeleteButtonProps {
  id: string;
  creatorId?: string | null;
}

const AgentDeleteButton: React.FC<AgentDeleteButtonProps> = ({
  id,
  creatorId,
}) => {
  const { userData } = useUserProvider();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const isOwner = Boolean(
    userData?.account_id && userData.account_id === creatorId,
  );

  const del = useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(
        `${getClientApiBaseUrl()}/api/agents/templates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = (await res.json().catch(() => null)) as
        | { status: "success" }
        | { status: "error"; error: string }
        | null;
      if (!res.ok || data?.status !== "success") {
        throw new Error(
          (data?.status === "error" && data.error) ||
            "Failed to delete template",
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    },
  });

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
            onClick={() => del.mutate()}
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
