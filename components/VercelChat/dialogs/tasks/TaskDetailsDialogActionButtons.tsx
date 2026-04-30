"use client";

import { Button } from "@/components/ui/button";
import { Pause, Trash2 } from "lucide-react";
import {
  useTaskDetailsDialogActionButtons,
  type TaskDetailsDialogActionButtonsProps,
} from "./useTaskDetailsDialogActionButtons";

export default function TaskDetailsDialogActionButtons(
  props: TaskDetailsDialogActionButtonsProps,
) {
  const {
    authenticated,
    handlePause,
    handleDelete,
    handleSave,
    isLoading,
    canEdit,
    isEnabled,
  } = useTaskDetailsDialogActionButtons(props);

  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-border justify-between shrink-0">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handlePause}
          disabled={isLoading}
          size="sm"
        >
          <Pause className="h-4 w-4 mr-2" />
          {isEnabled ? "Pause" : "Resume"}
        </Button>
        {authenticated && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-200 text-red-600 hover:bg-red-50"
            disabled={isLoading || !canEdit}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
      <Button onClick={handleSave} disabled={isLoading} size="sm">
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
