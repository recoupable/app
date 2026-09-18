import { usePathname, useRouter } from "next/navigation";
import { isTasksSection } from "@/lib/navigation/isTasksSection";
import { useUserProvider } from "@/providers/UserProvder";
import RecentChats from "../Sidebar/RecentChats";
import UserInfo from "../Sidebar/UserInfo";
import { v4 as uuidV4 } from "uuid";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RecentChatsSectionSkeleton } from "./RecentChatsSectionSkeleton";
import NewChatButton from "./NewChatButton";
import SecondaryNav from "./SecondaryNav";
import Divider from "./Divider";

interface MenuProps {
  isExpanded: boolean;
}

const Menu = ({ isExpanded }: MenuProps) => {
  const { push, prefetch } = useRouter();
  const pathname = usePathname();
  const { email, isPrepared } = useUserProvider();
  const isAgents = pathname.includes("/agents");
  const isTasks = isTasksSection(pathname);
  const isFiles = pathname.includes("/files");
  const isCatalogs = pathname.includes("/catalogs");
  const isArtists = pathname.includes("/artists");
  const isMusic = pathname.includes("/music");

  const goToItem = (link?: string) => {
    if (isPrepared()) {
      push(`/${link || uuidV4()}`);
    }
  };

  useEffect(() => {
    prefetch("/files");
    prefetch("/agents");
  }, [prefetch]);

  return (
    <div className="w-full h-full pb-2 px-2 hidden md:flex flex-col">
      <NewChatButton
        isExpanded={isExpanded}
        email={email}
        onClick={() => goToItem("chat")}
      />

      <SecondaryNav
        isExpanded={isExpanded}
        isAgents={isAgents}
        isTasks={isTasks}
        isFiles={isFiles}
        isCatalogs={isCatalogs}
        isArtists={isArtists}
        isMusic={isMusic}
        isSites={pathname.startsWith("/sites")}
        onNavigate={goToItem}
      />

      <Divider isExpanded={isExpanded} />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex flex-col flex-grow min-h-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, exit: { duration: 0.05 } }}
          >
            {!email ? (
              <RecentChatsSectionSkeleton />
            ) : (
              <RecentChats toggleModal={() => {}} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shrink-0 mt-auto px-0.5 pb-1">
        <UserInfo isExpanded={isExpanded} />
      </div>
    </div>
  );
};

export default Menu;
