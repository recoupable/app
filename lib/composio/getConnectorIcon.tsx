import {
  SiGooglesheets,
  SiGoogledrive,
  SiGoogledocs,
  SiTiktok,
  SiInstagram,
} from "@icons-pack/react-simple-icons";
import { Link2 } from "lucide-react";

/**
 * Get branded icon for a connector.
 * Uses Simple Icons for brand logos, falls back to Lucide for others.
 */
export function getConnectorIcon(slug: string, size = 24): React.ReactNode {
  const iconProps = { size, className: "shrink-0" };

  const icons: Record<string, React.ReactNode> = {
    googlesheets: <SiGooglesheets {...iconProps} color="#34A853" />,
    googledrive: <SiGoogledrive {...iconProps} color="#4285F4" />,
    googledocs: <SiGoogledocs {...iconProps} color="#4285F4" />,
    tiktok: <SiTiktok {...iconProps} />,
    instagram: <SiInstagram {...iconProps} color="#E4405F" />,
  };

  return (
    icons[slug] || (
      <Link2 size={size} className="shrink-0 text-muted-foreground" />
    )
  );
}
