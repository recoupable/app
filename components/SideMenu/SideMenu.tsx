import SideModal from "../SideModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserProvider } from "@/providers/UserProvder";
import RecentChats from "../Sidebar/RecentChats";
import UnlockPro from "../Sidebar/UnlockPro";
import UserInfo from "../Sidebar/UserInfo";
import Logo from "../Logo";
import { v4 as uuidV4 } from "uuid";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { PointerIcon } from "lucide-react";
import { Button } from "../ui/button";
import AgentsNavItem from "../Sidebar/AgentsNavItem";
import { usePathname } from "next/navigation";
import TasksNavItem from "../Sidebar/TasksNavItem";
import FilesNavItem from "../Sidebar/FilesNavItem";

const SideMenu = ({
  isVisible,
  toggleModal,
  onOpenArtists,
}: {
  isVisible: boolean;
  toggleModal: () => void;
  onOpenArtists?: () => void;
}) => {
  const { push } = useRouter();
  const pathname = usePathname();
  const { address, isPrepared } = useUserProvider();
  const { selectedArtist, sorted, toggleCreation } = useArtistProvider();
  const hasArtists = sorted.length > 0;
  const isArtistSelected = !!selectedArtist;
  const isAgents = pathname.includes("/agents");
  const isTasks = pathname.includes("/tasks");
  const isFiles = pathname.includes("/files");

  const goToItem = (link?: string) => {
    if (isPrepared()) {
      push(`/${link || uuidV4()}`);
      toggleModal();
    }
  };

  const handleArtistSelect = () => {
    if (hasArtists) {
      // Open the artist selection sidebar
      if (onOpenArtists) {
        onOpenArtists();
      }
    } else {
      // No artists yet, open the artist creation modal
      toggleCreation();
    }
    toggleModal();
  };

  return (
    <SideModal isVisible={isVisible} toggleModal={toggleModal}>
      <Link
        href="/"
        className="mt-0 shrink-0 hover:opacity-80 transition-opacity duration-200 w-fit"
        aria-label="Home"
      >
        <Logo />
      </Link>
      <div className="flex flex-col gap-1 w-full pb-2">
        <Button
          variant="outline"
          className="mt-2 rounded-xl md:mt-8 cursor-pointer"
          onClick={() => goToItem("chat")}
          aria-label={address ? "Start a new chat" : "Sign in to your account"}
        >
          {address ? "New Chat" : "Sign In"}
        </Button>
        {address && !isArtistSelected && (
          <Button
            variant="outline"
            onClick={handleArtistSelect}
            className="flex gap-3 items-center rounded-xl w-full"
            aria-label={
              hasArtists
                ? "Select your artist from the list"
                : "Add a new artist"
            }
          >
            <PointerIcon className="h-5 w-5" />
            {hasArtists ? "Select Your Artist" : "Add Your Artist"}
          </Button>
        )}
        <div className="flex flex-col gap-1 pt-2">
          <AgentsNavItem
            isActive={isAgents}
            onClick={() => goToItem("agents")}
          />
          <TasksNavItem isActive={isTasks} onClick={() => goToItem("tasks")} />
          <FilesNavItem isActive={isFiles} onClick={() => goToItem("files")} />
        </div>
      </div>
      {address && <RecentChats toggleModal={toggleModal} />}
      <div className="grow flex flex-col gap-1 md:gap-3 justify-end">
        <UnlockPro />
        <UserInfo />
      </div>
    </SideModal>
  );
};

export default SideMenu;
