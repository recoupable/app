import { getLocalTimezone } from "./getLocalTimezone";

/**
 * A short, sensible fallback list for engines that lack
 * `Intl.supportedValuesOf` (older Safari/Node). Covers the zones our users
 * are most likely to schedule against.
 */
const FALLBACK_ZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

/**
 * The full list of selectable IANA timezones, always including the viewer's
 * local zone. Prefers the runtime's canonical list, falling back to a curated
 * set when `Intl.supportedValuesOf` is unavailable.
 */
export function getTimezoneOptions(): string[] {
  const local = getLocalTimezone();
  let zones: string[];

  try {
    const supported = (Intl as IntlWithSupportedValues).supportedValuesOf?.(
      "timeZone",
    );
    zones = supported?.length ? supported : FALLBACK_ZONES;
  } catch {
    zones = FALLBACK_ZONES;
  }

  return zones.includes(local) ? zones : [local, ...zones];
}
