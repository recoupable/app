import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { getUserProfileState } from "@/lib/auth/getUserProfileState";
import UserProfileDropdown from "./UserProfileDropdown";
import UserProfileButtonSkeleton from "./UserProfileButtonSkeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const UserProfileButton = ({ isExpanded = true }: { isExpanded?: boolean }) => {
  const { email, userData } = useUserProvider();
  const { ready, authenticated } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const { data: organizations } = useAccountOrganizations();

  const profileState = getUserProfileState({
    isPrivyReady: ready,
    isAuthenticated: authenticated,
    hasUserData: !!userData,
  });

  // A signed-out visitor has no profile to load, so the slot stays empty
  // rather than showing a skeleton that never resolves next to a Sign In
  // button (chat#1912 row 2).
  if (profileState === "signed-out") return null;
  if (profileState === "loading") return <UserProfileButtonSkeleton />;

  const userName = userData?.name || email || userData?.wallet || "";
  const userImage = userData?.image;

  // Find selected org
  const selectedOrg = organizations?.find(
    (org) => org.organization_id === selectedOrgId
  );

  // When org selected: show org info prominently
  // When personal: show user info prominently
  const isOrgSelected = !!selectedOrgId && !!selectedOrg;

  const primaryName = isOrgSelected
    ? selectedOrg.organization_name || "Organization"
    : userName;

  const secondaryName = isOrgSelected ? userName : "Personal";

  const avatarImage = isOrgSelected
    ? selectedOrg.organization_image
    : userImage;

  const avatarInitials = isOrgSelected
    ? (selectedOrg.organization_name || "OR").slice(0, 2).toUpperCase()
    : userName
        .split(" ")
        .map((part: string) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full justify-start flex items-center gap-1.5 h-9 px-1 rounded-xl border border-transparent hover:border-muted-foreground/20 dark:hover:border-[#444] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Open user menu"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={avatarImage!} alt={primaryName} />
            <AvatarFallback className="text-[10px]">{avatarInitials}</AvatarFallback>
          </Avatar>
          <div className={cn(
            "min-w-0 text-left overflow-hidden transition-all duration-200",
            isExpanded ? "opacity-100 max-w-[150px] flex-1" : "opacity-0 max-w-0"
          )}>
            <p className="text-xs font-medium truncate dark:text-white leading-tight">
              {primaryName}
            </p>
          </div>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all duration-200",
            isExpanded ? "opacity-100 ml-auto" : "opacity-0 max-w-0 overflow-hidden"
          )} />
        </button>
      </DropdownMenuTrigger>
      <UserProfileDropdown />
    </DropdownMenu>
  );
};

export default UserProfileButton;
