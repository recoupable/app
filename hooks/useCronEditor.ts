import { useEffect, useMemo, useState } from "react";
import parseCronParts from "@/lib/cron/parseCronParts";
import deriveSimpleModeFromParts, {
  SimpleModeSettings,
} from "@/lib/cron/deriveSimpleModeFromParts";
import { parseCronToHuman } from "@/lib/tasks/parseCronToHuman";

export interface UseCronEditorArgs {
  cronExpression: string;
  onCronExpressionChange: (value: string) => void;
}

const DEFAULT_SIMPLE_MODE: SimpleModeSettings = {
  frequency: "daily",
  time: "09:00",
  dayOfWeek: "1",
  dayOfMonth: "1",
};

const useCronEditor = ({
  cronExpression,
  onCronExpressionChange,
}: UseCronEditorArgs) => {
  const parsedParts = useMemo(
    () => parseCronParts(cronExpression),
    [cronExpression]
  );
  const [fieldValues, setFieldValues] = useState<string[]>(parsedParts);
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [simpleMode, setSimpleMode] = useState<SimpleModeSettings>(() => {
    return deriveSimpleModeFromParts(parsedParts) ?? DEFAULT_SIMPLE_MODE;
  });

  useEffect(() => {
    setFieldValues(parsedParts);
    const derived = deriveSimpleModeFromParts(parsedParts);
    if (derived) {
      setSimpleMode(derived);
    }
  }, [parsedParts]);

  const handleFieldChange = (index: number) => (value: string) => {
    setFieldValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      const normalizedParts = updated.map((part) =>
        part.trim() === "" ? "*" : part.trim()
      );
      onCronExpressionChange(normalizedParts.join(" "));
      return updated;
    });
  };

  const handlePresetClick = (cronValue: string) => {
    onCronExpressionChange(cronValue);
    const derived = deriveSimpleModeFromParts(parseCronParts(cronValue));
    if (derived) {
      setSimpleMode(derived);
    }
  };

  const handleSimpleModeChange = (
    field: keyof SimpleModeSettings,
    value: string
  ) => {
    setSimpleMode((prev) => {
      const updated = { ...prev, [field]: value };

      const [hour, minute] =
        updated.frequency === "hourly" ? ["*", "0"] : updated.time.split(":");

      let cron = "* * * * *";

      switch (updated.frequency) {
        case "hourly":
          cron = "0 * * * *";
          break;
        case "daily":
          cron = `${minute} ${hour} * * *`;
          break;
        case "weekdays":
          cron = `${minute} ${hour} * * 1-5`;
          break;
        case "weekly":
          cron = `${minute} ${hour} * * ${updated.dayOfWeek}`;
          break;
        case "monthly":
          cron = `${minute} ${hour} ${updated.dayOfMonth} * *`;
          break;
      }

      onCronExpressionChange(cron);
      return updated;
    });
  };

  const normalizedCron = useMemo(() => {
    return fieldValues
      .map((part) => (part.trim() === "" ? "*" : part.trim()))
      .join(" ");
  }, [fieldValues]);

  const humanReadable = useMemo(() => {
    return parseCronToHuman(normalizedCron);
  }, [normalizedCron]);

  return {
    mode,
    setMode,
    simpleMode,
    handleSimpleModeChange,
    handlePresetClick,
    handleFieldChange,
    normalizedCron,
    humanReadable,
  };
};

export default useCronEditor;
