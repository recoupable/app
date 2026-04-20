import { Button } from "@/components/ui/button";
import { FC } from "react";
import { CRON_SIMPLE_PRESETS } from "@/lib/cron/cronPresetSchedules";

interface SimplePresetButtonsProps {
  cronExpression: string;
  disabled?: boolean;
  onPresetSelect: (cronValue: string) => void;
}

const SimplePresetButtons: FC<SimplePresetButtonsProps> = ({
  cronExpression,
  disabled = false,
  onPresetSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CRON_SIMPLE_PRESETS.map((preset) => (
        <Button
          key={preset.cron}
          variant={
            cronExpression.trim() === preset.cron ? "default" : "outline"
          }
          size="sm"
          onClick={() => onPresetSelect(preset.cron)}
          disabled={disabled}
          className="h-auto justify-start px-3 py-2 text-xs"
        >
          <span className="mr-2">{preset.icon}</span>
          <span className="text-balance">{preset.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default SimplePresetButtons;
