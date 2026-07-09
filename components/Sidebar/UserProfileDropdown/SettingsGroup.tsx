import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import ManageSubscriptionButton from "./ManageSubscriptionButton";
import ConnectorsMenuItem from "./ConnectorsMenuItem";
import ApiKeysMenuItem from "./ApiKeysMenuItem";
import themeLabel from "@/lib/sidebar/themeLabel";
import getThemeIcon from "@/lib/sidebar/getThemeIcon";

const SettingsGroup = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenuGroup>
      <ManageSubscriptionButton />
      <ConnectorsMenuItem />
      <ApiKeysMenuItem />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="cursor-pointer">
          {getThemeIcon(theme)}
          <span className="flex-1">Theme</span>
          <span className="text-xs text-muted-foreground">{themeLabel(theme)}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => setTheme("light")} className="cursor-pointer">
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {theme === "light" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme("dark")} className="cursor-pointer">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme("system")} className="cursor-pointer">
            <Monitor className="h-4 w-4" />
            <span>System</span>
            {theme === "system" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
};

export default SettingsGroup;
