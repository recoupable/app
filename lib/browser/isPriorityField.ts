import { PRIORITY_FIELDS } from "./priorityFields";

/**
 * Check if field name is a priority metric
 *
 * @param key
 */
export const isPriorityField = (key: string): boolean =>
  PRIORITY_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()));
