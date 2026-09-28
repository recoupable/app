(() => {
  const body = document.body;
  if (body.dataset.preview === "true") return;
  const frame = document.getElementById("experience");
  const endpoint = body.dataset.activityUrl;
  let visit;
  try {
    const key = `recoup-visit:${location.pathname}`;
    visit = sessionStorage.getItem(key) || crypto.randomUUID();
    sessionStorage.setItem(key, visit);
  } catch {
    visit = crypto.randomUUID();
  }
  const counts = new Map();
  function track(event) {
    if (
      !endpoint ||
      !["visit", "start", "complete", "replay", "share"].includes(event)
    )
      return;
    const count = counts.get(event) || 0;
    if (count >= (["visit", "start", "complete"].includes(event) ? 1 : 10))
      return;
    counts.set(event, count + 1);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: crypto.randomUUID(), visitId: visit, event }),
      keepalive: true,
    }).catch(() => {});
  }
  track("visit");
  window.addEventListener("message", (event) => {
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.data?.type === "recoup:activity") track(event.data.event);
    if (event.data?.type === "recoup:join") {
      const form = document.getElementById("fan-signup");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
      form?.querySelector("input[type=email]")?.focus({ preventScroll: true });
    }
  });
})();
