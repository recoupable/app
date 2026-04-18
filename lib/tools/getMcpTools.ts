import { ToolSet } from "ai";
import getSocialPosts from "./getSocialPosts";
import getPostComments from "./getPostComments";
import { webDeepResearch } from "./searchWeb";
import searchGoogleImages from "./searchGoogleImages";
import generateMermaidDiagram from "./generateMermaidDiagram";
import deleteArtist from "./deleteArtist";
import searchTwitter from "./searchTwitter";
import getTwitterTrends from "./getTwitterTrends";
import scrapeInstagramProfile from "./scrapeInstagramProfile";
import getApifyScraper from "./getApifyScraper";
import scrapeInstagramComments from "./scrapeInstagramComments";
import getVideoGameCampaignPlays from "./getVideoGameCampaignPlays";
import getSocialFans from "./getSocialFans";
import createReleaseReport from "./createReleaseReport";
import filesTools from "./files";
import browserTools from "./browser";
import getCatalogSongs from "./catalogs/getCatalogSongs";

export function getMcpTools(): ToolSet {
  const tools = {
    get_social_posts: getSocialPosts,
    get_post_comments: getPostComments,
    search_google_images: searchGoogleImages,
    web_deep_research: webDeepResearch,
    generate_mermaid_diagram: generateMermaidDiagram,
    delete_artist: deleteArtist,
    search_twitter: searchTwitter,
    get_twitter_trends: getTwitterTrends,
    scrape_instagram_profile: scrapeInstagramProfile,
    get_apify_scraper: getApifyScraper,
    scrape_instagram_comments: scrapeInstagramComments,
    get_video_game_campaign_plays: getVideoGameCampaignPlays,
    get_social_fans: getSocialFans,
    create_release_report: createReleaseReport,
    get_catalog_songs: getCatalogSongs,
    ...filesTools,
    ...browserTools,
  };

  return tools;
}
