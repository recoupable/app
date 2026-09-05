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

/** Remove asks first: detaching the card also turns auto top-up off. */
const RemoveCardButton = ({
  onRemove,
  disabled,
}: {
  onRemove: () => void;
  disabled: boolean;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        className="text-muted-foreground"
      >
        Remove
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove this card?</AlertDialogTitle>
        <AlertDialogDescription>
          Credit purchases will need a new card, and auto top-up turns off until
          one is added.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep card</AlertDialogCancel>
        <AlertDialogAction onClick={onRemove}>Remove card</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default RemoveCardButton;
