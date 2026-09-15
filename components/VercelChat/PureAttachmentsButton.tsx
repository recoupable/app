import { PaperclipIcon } from "lucide-react";
import { Button } from "../ui/button";
import { usePureFileAttachments } from "@/hooks/usePureFileAttachments";

function PureAttachmentsButton() {
  const { fileInputRef, handleFileChange, allowedTypes } =
    usePureFileAttachments();

  return (
    <>
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
        accept={allowedTypes.join(",")}
      />
      <Button
        aria-label="Attach files"
        title="Attach files, or type @ to use workspace files"
        data-testid="attachments-button"
        className="rounded-md rounded-bl-lg p-[7px] h-fit border-border hover:bg-accent text-foreground"
        onClick={(event) => {
          event.preventDefault();
          fileInputRef.current?.click();
        }}
        variant="ghost"
      >
        <PaperclipIcon size={14} />
      </Button>
    </>
  );
}

export default PureAttachmentsButton;
