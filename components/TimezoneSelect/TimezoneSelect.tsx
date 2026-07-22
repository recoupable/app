"use client";

import { useMemo } from "react";
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTimezoneOptions } from "@/lib/timezone/getTimezoneOptions";
import { formatTimezoneLabel } from "@/lib/timezone/formatTimezoneLabel";

interface TimezoneSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Picks the IANA timezone a task's cron schedule is interpreted in. Defaults to
 * the viewer's local zone upstream; the full option list always includes it.
 */
const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const options = useMemo(() => getTimezoneOptions(), []);

  return (
    <div className="space-y-2">
      <Label
        htmlFor="task-timezone"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <Globe className="h-4 w-4" />
        Timezone
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="task-timezone" className="w-full text-xs">
          <SelectValue placeholder="Select a timezone">
            {formatTimezoneLabel(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((zone) => (
            <SelectItem key={zone} value={zone} className="text-xs">
              {formatTimezoneLabel(zone)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Scheduled runs fire at this zone&apos;s local time.
      </p>
    </div>
  );
};

export default TimezoneSelect;
