import { usePathname, useRouter } from "next/navigation";
import { useUserProvider } from "@/providers/UserProvder";
import RecentChats from "../Sidebar/RecentChats";
import UserInfo from "../Sidebar/UserInfo";
import { v4 as uuidV4 } from "uuid";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RecentChatsSectionSkeleton } from "./RecentChatsSectionSkeleton";
import LogoRow from "./LogoRow";
import NewChatButton from "./NewChatButton";
import SecondaryNav from "./SecondaryNav";
import Divider from "./Divider";

interface MenuProps {
  isExpanded: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const Menu = ({ isExpanded, isPinned = false, onTogglePin }: MenuProps) => {
  const { push, prefetch } = useRouter();
  const pathname = usePathname();
  const { email, isPrepared } = useUserProvider();
  const isAgents = pathname.includes("/agents");
  const isTasks = pathname.includes("/tasks");
  const isFiles = pathname.includes("/files");

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
    <div className="w-full h-screen pt-5 pb-2 px-2 hidden md:flex flex-col">
      <LogoRow isExpanded={isExpanded} isPinned={isPinned} onTogglePin={onTogglePin} />

      <NewChatButton isExpanded={isExpanded} email={email} onClick={() => goToItem("chat")} />

      <SecondaryNav
        isExpanded={isExpanded}
        isAgents={isAgents}
        isTasks={isTasks}
        isFiles={isFiles}
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
