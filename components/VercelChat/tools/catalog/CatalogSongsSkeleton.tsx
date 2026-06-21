import { ListMusic } from "lucide-react";
import ToolCardSkeleton from "../shared/ToolCardSkeleton";

export default function CatalogSongsSkeleton() {
  return (
    <ToolCardSkeleton
      icon={ListMusic}
      label="Processing catalog songs…"
      rows={4}
    />
  );
}
