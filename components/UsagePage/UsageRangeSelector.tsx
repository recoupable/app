import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USAGE_RANGES, type UsageRange } from "@/lib/usage/usageRanges";

interface UsageRangeSelectorProps {
  value: UsageRange;
  onChange: (range: UsageRange) => void;
}

/** The span the table, its total and the chart cover. */
const UsageRangeSelector = ({ value, onChange }: UsageRangeSelectorProps) => (
  <Tabs value={value} onValueChange={(next) => onChange(next as UsageRange)}>
    <TabsList aria-label="Usage period">
      {USAGE_RANGES.map((range) => (
        <TabsTrigger
          key={range}
          value={range}
          className="px-2.5 text-xs sm:px-3 sm:text-sm"
        >
          {range}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default UsageRangeSelector;
