/** True for an error carrying an HTTP 4xx `status`, the way the account fetchers throw. */
const isClientError = (error: unknown): boolean => {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500;
};

export default isClientError;
