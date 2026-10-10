const escapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export function escapePlayerHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => escapes[c]!);
}
