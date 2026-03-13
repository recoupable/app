import { z } from "zod";
import { tool } from "ai";
import { searchGoogleImages } from "@/lib/serpapi/searchImages";
import type { SearchProgress } from "./searchWeb/types";

const getSearchGoogleImagesTool = () => {
  return tool({
    description:
      "Search for EXISTING images on Google Images. Use this to FIND real photos, not create new ones.\n\n" +
      "Use this tool when the user wants to:\n" +
      "- FIND existing photos of artists, concerts, album covers, or events\n" +
      "- SEE what something looks like (e.g., 'show me photos of Mac Miller', 'find concert images')\n" +
      "- GET reference images or inspiration from real photos\n" +
      "- SEARCH for visual content that already exists online\n\n" +
      "DO NOT use this tool when the user wants to:\n" +
      "- CREATE, GENERATE, or MAKE new images (use generate_image instead)\n" +
      "- DESIGN custom album covers or artwork (use generate_image tools)\n" +
      "- EDIT existing images (use edit_image instead)\n\n" +
      "Key distinction: This finds what EXISTS, generative tools create what DOESN'T exist yet.\n\n" +
      "Returns thumbnails and full-resolution URLs for displaying in chat or emails.\n\n" +
      "TECHNICAL NOTES: Keep parameters simple. Query is most important. Optional filters can cause errors - if tool fails, retry with just query and limit.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query (e.g., 'Mac Miller concert', 'Wiz Khalifa album cover'). Be specific for best results.",
        ),
      limit: z.number().optional().describe("Number of images to return (1-100, default: 8)."),
      imageSize: z
        .enum(["l", "m", "i"])
        .optional()
        .describe(
          "Image size: 'l' (large, recommended), 'm' (medium), 'i' (icon/small). Leave unset if unsure.",
        ),
      imageType: z
        .enum(["photo", "clipart", "lineart", "animated"])
        .optional()
        .describe(
          "Type of image: 'photo' (default, recommended), 'clipart', 'lineart', 'animated'. Leave unset if unsure.",
        ),
      aspectRatio: z
        .enum(["square", "wide", "tall", "panoramic"])
        .optional()
        .describe(
          "Aspect ratio filter. WARNING: May not always be supported. Only use if specifically requested. Leave unset for general searches.",
        ),
    }),
    execute: async function* ({
      query,
      limit = 8,
      imageSize = "l",
      imageType = "photo",
      aspectRatio,
    }) {
      if (!query) {
        throw new Error("Search query is required");
      }

      // Initial searching status (streaming progress to UI)
      yield {
        status: "searching" as const,
        message: "Searching Web for Images...",
        query,
      } satisfies SearchProgress;

      // Small delay to ensure UI renders the searching state
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Perform the search
        const response = await searchGoogleImages({
          query,
          limit,
          imageSize,
          imageType,
          aspectRatio,
        });

        // Build final result with all image data
        const finalResult = {
          success: true,
          query,
          total_results: response.images_results.length,
          images: response.images_results.map(img => ({
            position: img.position,
            thumbnail: img.thumbnail,
            original: img.original,
            width: img.original_width,
            height: img.original_height,
            title: img.title,
            source: img.source,
            link: img.link,
          })),
          message: `Found ${response.images_results.length} images for "${query}"`,
        };

        // MUST yield (not return) for async generators to send to client
        // Return value stays on server and never reaches the UI
        yield finalResult;

        // Also return it so AI model gets the data
        return finalResult;
      } catch (error) {
        throw new Error(`Google Images search failed: ${error}`);
      }
    },
  });
};

export default getSearchGoogleImagesTool();
