type Outcome = "admitted" | "not_admitted" | "unknown";

/** Classify only bounded error evidence; unreadable bytes never prove rejection. */
export async function classifyChatAdmissionFailure(
  response: Response,
  signal?: AbortSignal,
): Promise<{ outcome: Outcome; diagnostic: Uint8Array }> {
  const reader = response.body?.getReader();
  if (!reader) return { outcome: "unknown", diagnostic: new Uint8Array() };
  const captured = new Uint8Array(8192);
  let size = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  const result = (outcome: Outcome) => ({
    outcome,
    diagnostic: captured.slice(0, size),
  });
  const interrupted = new Promise<never>((_, reject) => {
    abort = () => reject(new Error("Admission classification cancelled"));
    signal?.addEventListener("abort", abort, { once: true });
    timeout = setTimeout(
      () => reject(new Error("Admission classification timed out")),
      5000,
    );
    if (signal?.aborted) abort();
  });
  try {
    while (true) {
      const next = await Promise.race([reader.read(), interrupted]);
      if (next.done) break;
      const remaining = 8192 - size;
      captured.set(next.value.subarray(0, remaining), size);
      size += Math.min(next.value.byteLength, remaining);
      if (next.value.byteLength > remaining)
        throw new Error("Error body exceeded bound");
    }
    const value: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        captured.subarray(0, size),
      ),
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      return result("unknown");
    const body = value as Record<string, unknown>;
    if (typeof body.error !== "string") return result("unknown");
    if (body.status === "error" && body.admission === "not_admitted")
      return result("not_admitted");
    if (
      (response.status === 409 || response.status === 503) &&
      body.status === "error" &&
      body.admission === "admitted" &&
      typeof body.runId === "string" &&
      body.runId.length > 0 &&
      body.runId.length <= 256 &&
      [
        "stream_continuation_upgrade_required",
        "stream_continuation_evidence_unavailable",
        "stream_continuation_invalid",
      ].includes(body.error)
    )
      return result("admitted");
    // Preserve the existing API's bounded, parsed pre-admission 4xx errors.
    // Protocol errors require their explicit outcome even when they use409.
    if (
      !Object.hasOwn(body, "admission") &&
      !body.error.startsWith("stream_continuation_") &&
      [400, 401, 403, 404, 409, 422, 429].includes(response.status)
    )
      return result("not_admitted");
    return result("unknown");
  } catch {
    // Keep a private bounded diagnostic; never put arbitrary server bytes into
    // the UI error or infer an outcome from a partial JSON prefix.
    return result("unknown");
  } finally {
    clearTimeout(timeout);
    if (abort) signal?.removeEventListener("abort", abort);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
