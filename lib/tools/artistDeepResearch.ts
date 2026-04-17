import { z } from "zod";
import { tool } from "ai";
import { getArtistSocials } from "../api/artist/getArtistSocials";
import { SPOTIFY_DEEP_RESEARCH_REQUIREMENTS } from "../consts";

const artistDeepResearch = tool({
  description: `
  Conducts comprehensive research on an artist across multiple platforms and generates a detailed report.

  Spotify research requirements:
  ${SPOTIFY_DEEP_RESEARCH_REQUIREMENTS}

  Other research requirements:
  - Socials: Follower counts, engagement rates, top content, branding, posting consistency
  - Website: Branding, layout, contact info, mailing list
  - YouTube: Consistency, video quality, viewership, contact info
  - Marketing: Campaign ideas, revenue streams, collaboration opportunities, brand partnerships
  `,
  inputSchema: z.object({
    artist_account_id: z.string().describe("Artist account ID to research"),
    access_token: z
      .string()
      .describe(
        "Privy access token forwarded from the caller so mono/api can authorize the socials fetch."
      ),
  }),
  execute: async ({ artist_account_id, access_token }) => {
    const data = await getArtistSocials(artist_account_id, access_token);
    return {
      artistSocials: data,
      artist_account_id,
      success: true,
    };
  },
});

export default artistDeepResearch;
