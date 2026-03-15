/**
 * Validates UUID v4 format
 *
 * @param uuid - String to validate as UUID
 * @returns true if valid UUID v4, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }

  // UUID v4 format: 8-4-4-4-12 hexadecimal characters
  // Version 4 has '4' in the version position
  // Variant has [89ab] in the variant position
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidV4Regex.test(uuid);
}

export default isValidUUID;
