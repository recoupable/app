"use client";

import { usePathname } from "next/navigation";
import { isPublicRoute } from "@/lib/routes/isPublicRoute";

/**
 * Mounts its children only on authed app routes. Public pages (the shareable
 * artist profile) render without the app chrome — no sidebar, no header —
 * so wrapping chrome in this gate keeps the layout otherwise untouched.
 */
const HideOnPublicRoutes = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (isPublicRoute(pathname)) return null;
  return <>{children}</>;
};

export default HideOnPublicRoutes;
