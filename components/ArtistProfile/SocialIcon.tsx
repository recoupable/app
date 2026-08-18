const STROKE = "currentColor";

/**
 * Minimal stroke icons for the platforms the public artist page links out to.
 * Unknown platforms fall back to a globe so a new social type never renders
 * blank.
 */
const SocialIcon = ({ type }: { type: string }) => {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: STROKE,
    strokeWidth: 1.5,
  };
  switch (type.toUpperCase()) {
    case "SPOTIFY":
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6.5" />
          <path d="M5 6.5c2-.6 4.3-.3 6 .8M5.4 8.7c1.6-.5 3.4-.2 4.8.6M5.8 10.8c1.2-.4 2.6-.2 3.7.5" />
        </svg>
      );
    case "INSTAGRAM":
      return (
        <svg {...common} aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="3.5" />
          <circle cx="8" cy="8" r="3" />
          <circle cx="12" cy="4" r="0.5" fill={STROKE} />
        </svg>
      );
    case "YOUTUBE":
      return (
        <svg {...common} aria-hidden>
          <rect x="1.5" y="3.5" width="13" height="9" rx="2.5" />
          <path d="M6.8 6l3 2-3 2z" fill={STROKE} stroke="none" />
        </svg>
      );
    case "TIKTOK":
      return (
        <svg {...common} aria-hidden>
          <path d="M9.5 2.5v7.2a2.8 2.8 0 1 1-2.4-2.77" />
          <path d="M9.5 4.2c.7 1.2 1.9 2 3.2 2.1" />
        </svg>
      );
    case "TWITTER":
    case "X":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6.5" />
          <path d="M1.5 8h13M8 1.5c1.8 1.8 1.8 11.2 0 13-1.8-1.8-1.8-11.2 0-13z" />
        </svg>
      );
  }
};

export default SocialIcon;
