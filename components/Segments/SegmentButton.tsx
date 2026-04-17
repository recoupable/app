import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Segment } from "@/lib/supabase/getArtistSegments";
import SegmentFanCircles from "./SegmentFanCircles";

interface SegmentButtonProps {
  segment: Segment;
}

const SegmentButton = ({ segment }: SegmentButtonProps) => {
  const fansWithAvatars = segment.fans?.filter((fan) => fan.avatar) || [];

  return (
    <Card className="p-6 border border-border-light transition-all duration-200 relative">
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-base font-medium text-foreground">
          {segment.name}
        </h3>

        {/* Fan Avatars and Count */}
        <div className="flex items-center space-x-3">
          {fansWithAvatars.length > 0 ? (
            <SegmentFanCircles
              fans={fansWithAvatars}
              maxVisible={3}
              totalCount={segment.size}
            />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          )}
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">{segment.size} Fans</span>
        </div>
      </div>
    </Card>
  );
};

export default SegmentButton;
