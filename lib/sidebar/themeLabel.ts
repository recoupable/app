/**
 * Maps a next-themes theme value to a human-readable label.
 * Returns "Dark", "Light", or "System" as the fallback.
 *
 * @param theme
 */
const themeLabel = (theme: string | undefined): string => {
  if (theme === "dark") return "Dark";
  if (theme === "light") return "Light";
  return "System";
};

export default themeLabel;
