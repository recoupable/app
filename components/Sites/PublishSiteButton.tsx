import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
/** Review is advisory; only missing source or a publication request disables publishing. */
export function PublishSiteButton({
  available,
  publishing,
  published,
  onPublish,
}: {
  available: boolean;
  publishing: boolean;
  published: boolean;
  onPublish: () => void;
}) {
  return (
    <Button
      size="sm"
      disabled={publishing || !available}
      onClick={onPublish}
      title={
        available
          ? "Publish the latest saved preview; review approval is optional"
          : "Available when the first working preview is ready"
      }
    >
      {publishing && <Loader2 size={14} className="animate-spin" />}
      {published ? "Publish changes" : "Publish"}
    </Button>
  );
}
