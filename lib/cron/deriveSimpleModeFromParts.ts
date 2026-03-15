import { padTimePart } from "./padTimePart";

export type SimpleModeFrequency = "hourly" | "daily" | "weekdays" | "weekly" | "monthly";

export interface SimpleModeSettings {
  frequency: SimpleModeFrequency;
  time: string;
  dayOfWeek: string;
  dayOfMonth: string;
}

export const deriveSimpleModeFromParts = (parts: string[]): SimpleModeSettings | null => {
  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;

  if (minute === "0" && hour === "*" && dayOfMonth === "*" && dayOfWeek === "*") {
    return {
      frequency: "hourly",
      time: "00:00",
      dayOfWeek: "1",
      dayOfMonth: "1",
    };
  }

  const hourNum = Number.parseInt(hour, 10);
  const minuteNum = Number.parseInt(minute, 10);

  if (
    Number.isNaN(hourNum) ||
    Number.isNaN(minuteNum) ||
    hourNum < 0 ||
    hourNum > 23 ||
    minuteNum < 0 ||
    minuteNum > 59
  ) {
    return null;
  }

  const time = `${padTimePart(hourNum)}:${padTimePart(minuteNum)}`;

  if (dayOfMonth === "*" && dayOfWeek === "*") {
    return {
      frequency: "daily",
      time,
      dayOfWeek: "1",
      dayOfMonth: "1",
    };
  }

  if (dayOfMonth === "*" && dayOfWeek === "1-5") {
    return {
      frequency: "weekdays",
      time,
      dayOfWeek: "1",
      dayOfMonth: "1",
    };
  }

  if (dayOfMonth === "*" && /^[0-6]$/.test(dayOfWeek)) {
    return {
      frequency: "weekly",
      time,
      dayOfWeek,
      dayOfMonth: "1",
    };
  }

  if (dayOfWeek === "*" && /^(?:[1-9]|[12][0-9]|3[01])$/.test(dayOfMonth)) {
    return {
      frequency: "monthly",
      time,
      dayOfWeek: "1",
      dayOfMonth,
    };
  }

  return null;
};

export default deriveSimpleModeFromParts;
