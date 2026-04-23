import { Button } from "@/components/ui/button";
import { FC } from "react";

interface SimplePreset {
  label: string;
  value: string;
  icon: string;
}

const PRESET_SCHEDULES: SimplePreset[] = [
  { label: "Every day at 9:00 AM", value: "0 9 * * *", icon: "☀️" },
  { label: "Every weekday at 9:00 AM", value: "0 9 * * 1-5", icon: "💼" },
  { label: "Every Monday at 9:00 AM", value: "0 9 * * 1", icon: "📅" },
  { label: "Every hour", value: "0 * * * *", icon: "⏰" },
  { label: "Every day at noon", value: "0 12 * * *", icon: "🌞" },
  { label: "Every day at 6:00 PM", value: "0 18 * * *", icon: "🌆" },
  { label: "First day of every month", value: "0 9 1 * *", icon: "📆" },
];

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
      {PRESET_SCHEDULES.map((preset) => (
        <Button
          key={preset.value}
          variant={
            cronExpression.trim() === preset.value ? "default" : "outline"
          }
          size="sm"
          onClick={() => onPresetSelect(preset.value)}
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
