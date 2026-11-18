/** A confirmed admission with an unavailable stream must never become a retryable draft. */
export async function isAdmittedContinuationFailure(
  response: Response,
): Promise<boolean> {
  if (response.ok || (response.status !== 409 && response.status !== 503))
    return false;
  const reader = response.clone().body?.getReader();
  if (!reader) return false;
  const bytes: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 8192) return false;
      bytes.push(next.value);
    }
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of bytes) {
      joined.set(chunk, offset);
      offset += chunk.length;
    }
    const value = JSON.parse(new TextDecoder().decode(joined));
    return (
      value?.status === "error" &&
      value.admission === "admitted" &&
      typeof value.runId === "string" &&
      value.runId.length > 0 &&
      value.runId.length <= 256 &&
      [
        "stream_continuation_upgrade_required",
        "stream_continuation_evidence_unavailable",
        "stream_continuation_invalid",
      ].includes(value.error)
    );
  } catch {
    return false;
  } finally {
    // Do not await tee cancellation: the SDK still owns the original response.
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
