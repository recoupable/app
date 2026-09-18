"use client";

import { useState } from "react";
import Menu from "./Menu";
import AccountModal from "../AccountModal";
import OrgSettingsModal from "../Organization/OrgSettingsModal";
import CreateOrgModal from "../Organization/CreateOrgModal";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isOpen = hovered || focused;

  return (
    <div className="relative hidden h-full w-14 shrink-0 md:block">
      <aside
        aria-label="Main navigation"
        className={cn(
          "absolute inset-y-0 left-0 z-40 overflow-hidden bg-sidebar shadow-[1px_0_0_var(--border)]",
          isOpen
            ? "w-[216px] shadow-[1px_0_0_var(--border),8px_0_24px_var(--surface-shadow)]"
            : "w-14",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setFocused(false);
          }
        }}
      >
        <Menu isExpanded={isOpen} />
      </aside>
      <AccountModal />
      <OrgSettingsModal />
      <CreateOrgModal />
    </div>
  );
};

export default Sidebar;
