"use client";

import { Button } from "@/components/ui/button";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function CreateTaskFormActions() {
  const {
    isSubmitting,
    submitError,
    handleCancel,
    artistOptions,
  } = useCreateTaskFormContext();

  return (
    <>
      {submitError ? (
        <p id="task-submit-error" role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || artistOptions.length === 0}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </>
  );
}
