import useGenerateSegmentReport from "@/hooks/useGenerateSegmentReport";
import type { Segment } from "@/types/Segment";
import SegmentButton from "./SegmentButton";

interface SegmentsProps {
  segments: Segment[];
}

const Segments = ({ segments }: SegmentsProps) => {
  const { handleGenerateReport } = useGenerateSegmentReport();

  const sortedSegments = [...segments].sort((a, b) => b.size - a.size);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {sortedSegments.map((segment) => (
        <SegmentButton
          key={segment.id}
          segment={segment}
          onGenerateReport={handleGenerateReport}
        />
      ))}
    </div>
  );
};

export default Segments;
