import { type Segment } from "@/lib/supabase/getArtistSegments";
import SegmentButton from "./SegmentButton";

interface SegmentsProps {
  segments: Segment[];
}

const Segments = ({ segments }: SegmentsProps) => {
  const sortedSegments = [...segments].sort((a, b) => b.size - a.size);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {sortedSegments.map((segment) => (
        <SegmentButton key={segment.id} segment={segment} />
      ))}
    </div>
  );
};

export default Segments;
