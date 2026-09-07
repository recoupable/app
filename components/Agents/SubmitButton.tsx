import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting?: boolean;
  submitLabel?: string;
}

const SubmitButton = ({ isSubmitting, submitLabel }: SubmitButtonProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="submit"
        size="sm"
        className="rounded-xl"
        disabled={Boolean(isSubmitting)}
        aria-busy={Boolean(isSubmitting)}
      >
        {isSubmitting ? (
          <>
            <Loader className="animate-spin" />
            {submitLabel ? `${submitLabel}...` : "Saving..."}
          </>
        ) : (
          (submitLabel ?? "Save")
        )}
      </Button>
    </div>
  );
};

export default SubmitButton;
