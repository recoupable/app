"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Menu from "./Menu";
import AccountModal from "../AccountModal";
import OrgSettingsModal from "../Organization/OrgSettingsModal";
import CreateOrgModal from "../Organization/CreateOrgModal";
import useIsMobile from "@/hooks/useIsMobile";
import useSidebarPin from "@/hooks/useSidebarPin";

const Sidebar = () => {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const { isPinned, togglePin } = useSidebarPin();
  const isMobile = useIsMobile();

  const isOpen = isPinned || menuExpanded;
  const animate = { width: isOpen ? 240 : 56 };
  const initial = { width: 56 };

  return (
    <motion.div
      className="bg-sidebar overflow-hidden"
      animate={animate}
      initial={initial}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => { if (!isPinned) setMenuExpanded(!isMobile); }}
      onMouseLeave={() => { if (!isPinned) setMenuExpanded(false); }}
    >
      <Menu
        isExpanded={isOpen}
        isPinned={isPinned}
        onTogglePin={togglePin}
      />
      <AccountModal />
      <OrgSettingsModal />
      <CreateOrgModal />
    </motion.div>
  );
};

export default Sidebar;
