/**
 * Shared types for SerpAPI Google Images integration
 */

export interface SerpApiImageResult {
  position: number;
  thumbnail: string;
  original: string;
  original_width: number;
  original_height: number;
  title: string;
  link: string;
  source: string;
  is_product?: boolean;
}

export interface SerpApiResponse {
  images_results: SerpApiImageResult[];
  search_metadata?: {
    id: string;
    status: string;
    created_at: string;
  };
}

export interface SearchImagesOptions {
  query: string;
  limit?: number;
  page?: number;
  imageSize?: "l" | "m" | "i";
  imageType?: "photo" | "clipart" | "lineart" | "animated";
  aspectRatio?: "square" | "wide" | "tall" | "panoramic";
}
