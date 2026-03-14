export const isImagePath = (value: string): boolean => {
  const lower = value.toLowerCase().split("?")[0];
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] as const;
  return imageExtensions.some(ext => lower.endsWith(ext));
};

export default isImagePath;
