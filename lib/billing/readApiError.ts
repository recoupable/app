/** The api's `{ error }` message on a non-OK response, else "HTTP <status>". */
const readApiError = async (response: Response): Promise<Error> => {
  const body = await response.json().catch(() => ({}));
  return new Error(
    typeof body?.error === "string" ? body.error : `HTTP ${response.status}`,
  );
};

export default readApiError;
