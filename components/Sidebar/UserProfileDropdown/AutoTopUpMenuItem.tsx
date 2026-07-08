import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import useAutoRecharge from "@/hooks/useAutoRecharge";

/**
 * Toggles automatic credit top-up. Checked = the platform may top up the
 * saved card off-session when credits run out; unchecked = topping up stays
 * an explicit checkout action. Renders the live setting from the api.
 */
const AutoTopUpMenuItem = () => {
  const { enabled, isLoading, isUpdating, setEnabled } = useAutoRecharge();

  return (
    <DropdownMenuCheckboxItem
      checked={enabled}
      disabled={isLoading || isUpdating}
      onCheckedChange={(checked) => setEnabled(checked === true)}
      onSelect={(event) => event.preventDefault()}
      className="cursor-pointer"
    >
      Automatic top-up
    </DropdownMenuCheckboxItem>
  );
};

export default AutoTopUpMenuItem;
