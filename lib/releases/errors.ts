export const RELEASE_CASE_ERROR =
  "Unable to load or save this review. Reload the case to check current evidence and access.";
/** Only locally authored recovery messages may reach the private-case UI. */
export class ReleaseCaseRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReleaseCaseRequestError";
  }
}
