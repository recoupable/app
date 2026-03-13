export const parseMentionedIds = (value: string | undefined): Set<string> => {
  const ids = new Set<string>();
  const text = value || "";
  const regex = /@\[[^\]]+\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text))) {
    if (m[1]) ids.add(m[1]);
  }
  return ids;
};

export default parseMentionedIds;
