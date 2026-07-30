import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The sidebar's account slot for a visitor who is not signed in. The slot is
 * where account state lives, so it offers the way in rather than rendering a
 * profile skeleton that can never resolve (chat#1912 row 2).
 */
const SignInSlotButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    type="button"
    onClick={onClick}
    aria-label="Sign in"
    className="w-full justify-start items-center gap-2 h-9 px-1 rounded-xl border border-transparent hover:border-muted-foreground/20 dark:hover:border-[#444] cursor-pointer"
  >
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
      <LogIn className="h-3.5 w-3.5" />
    </div>
    <span className="text-xs font-medium">Sign in</span>
  </Button>
);

export default SignInSlotButton;
