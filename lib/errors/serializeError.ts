/**
 * Interface for serialized error objects
 */
export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

/**
 * Extracts serializable properties from error objects
 * Ensures errors can be properly JSON serialized
 *
 * @param error
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: "UnknownError",
    message: String(error),
  };
}
