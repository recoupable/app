export const isTextMimeType = (type?: string | null): boolean => {
  if (!type) return true; // Treat missing MIME as text for knowledge files
  const t = type.toLowerCase();
  if (t.startsWith("text/")) return true;
  if (t.includes("json")) return true;
  if (t.includes("xml")) return true;
  if (t.includes("yaml") || t.includes("yml")) return true;
  if (t.includes("csv")) return true;
  if (t.includes("markdown")) return true;
  return false;
};

export default isTextMimeType;
