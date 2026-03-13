import { z } from "zod";

// Validate schema complexity to prevent DoS
const MAX_SCHEMA_KEYS = 20;

/**
 *
 * @param schema
 */
export function schemaToZod(schema: Record<string, string>): z.ZodObject<z.ZodRawShape> {
  const schemaKeys = Object.keys(schema);

  if (schemaKeys.length > MAX_SCHEMA_KEYS) {
    throw new Error(`Schema has too many fields (max ${MAX_SCHEMA_KEYS})`);
  }

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, type] of Object.entries(schema)) {
    if (typeof type === "string") {
      switch (type.toLowerCase()) {
        case "string":
          shape[key] = z.string();
          break;
        case "number":
          shape[key] = z.number();
          break;
        case "boolean":
          shape[key] = z.boolean();
          break;
        case "array":
          shape[key] = z.array(z.unknown());
          break;
        default:
          shape[key] = z.unknown();
      }
    } else {
      shape[key] = z.unknown();
    }
  }

  return z.object(shape);
}
