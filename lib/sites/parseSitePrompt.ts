export function parseSitePrompt(message: string): {
  releaseUrl: string;
  brief: string;
} {
  const links = [
    ...message.matchAll(
      /https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:track|album|playlist)\/[a-zA-Z0-9]+(?:\?[^\s<>]*)?/gi,
    ),
  ];
  if (links.length !== 1)
    throw new Error(
      links.length
        ? "Use one Spotify link per site."
        : "Add a Spotify track, album, or playlist link to your message.",
    );
  const match = links[0];
  const releaseUrl = match[0].replace(/[.,!?)\]]+$/, "");
  const brief = (
    message.slice(0, match.index) +
    message.slice(match.index! + match[0].length)
  ).trim();
  if (brief.length > 6000)
    throw new Error("Keep your description under 6,000 characters.");
  return { releaseUrl, brief };
}
