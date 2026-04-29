// YouTube API Response Types

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

// Interface for detailed channel information from getYouTubeChannelInfo tool
export interface YouTubeChannelInfoResult {
  success: boolean;
  status: string;
  message?: string;
  channels?: YouTubeChannelData[];
}

// YouTube Channel Data Types (from channel-fetcher.ts)
export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default?: { url?: string | null };
    medium?: { url?: string | null };
    high?: { url?: string | null };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    hiddenSubscriberCount?: boolean;
  };
  customUrl?: string | null;
  country?: string | null;
  publishedAt: string;
  branding?: {
    keywords?: string | null;
    defaultLanguage?: string | null;
  };
  uploadsPlaylistId?: string;
}

export interface YouTubeChannelFetchResult {
  success: boolean;
  channelData?: YouTubeChannelData;
  error?: {
    code: "NO_CHANNELS" | "API_ERROR";
    message: string;
  };
}

// Type for channel info from YouTubeChannelInfoResult
export interface ChannelInfoResult {
  id: string;
  title: string;
  description?: string;
  thumbnails?: {
    default?: { url?: string | null };
    medium?: { url?: string | null };
    high?: { url?: string | null };
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
  customUrl?: string | null;
  country?: string | null;
  publishedAt?: string;
}

// Token Validation Types (from token-validator.ts)
export interface YouTubeTokenValidationResult {
  success: boolean;
  tokens?: YouTubeTokensRow;
  error?: {
    code:
      | "NO_TOKENS"
      | "EXPIRED"
      | "FETCH_ERROR"
      | "REFRESH_INCOMPLETE_CREDENTIALS"
      | "REFRESH_GENERAL_FAILURE"
      | "DB_UPDATE_FAILED"
      | "REFRESH_INVALID_GRANT"
      | "EXPIRED_NO_REFRESH";
    message: string;
  };
}

// Component Props Types
export interface YouTubeChannelDisplayProps {
  channel: YouTubeChannelData;
  isLive?: boolean;
}

// YouTube Database Token Types (using generated database types)
export type YouTubeTokensRow = Tables<"youtube_tokens">;
export type YouTubeTokensInsert = TablesInsert<"youtube_tokens">;
export type YouTubeTokensUpdate = TablesUpdate<"youtube_tokens">;

// Error response types for different contexts
export interface ToolErrorResponse {
  success: false;
  status: "error";
  message: string;
}

export interface AuthStatusErrorResponse {
  authenticated: false;
  message: string;
}

export interface APIErrorResponse {
  success: false;
  status: "error";
  message: string;
}

export interface UtilityErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Success response types
export interface ToolSuccessResponse {
  success: true;
  status: "success";
  message: string;
  [key: string]: unknown;
}

export interface AuthStatusSuccessResponse {
  authenticated: true;
  message: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface APISuccessResponse {
  success: true;
  status: "success";
  message: string;
  [key: string]: unknown;
}

export interface UtilitySuccessResponse {
  success: true;
  [key: string]: unknown;
}

// Monetization Check Types
export interface MonetizationCheckResult {
  success: boolean;
  isMonetized?: boolean;
  error?: {
    code:
      | "NO_TOKENS"
      | "EXPIRED"
      | "FETCH_ERROR"
      | "INSUFFICIENT_SCOPE"
      | "ANALYTICS_ERROR"
      | "CHANNEL_NOT_FOUND"
      | "API_ERROR";
    message: string;
  };
}

export interface MonetizationAnalyticsData {
  channelId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  estimatedRevenue?: number;
  hasRevenueData: boolean;
}

// Result interface for revenue data
export interface YouTubeRevenueResult {
  success: boolean;
  status: string;
  message?: string;
  revenueData?: {
    totalRevenue: number;
    dailyRevenue: Array<{
      date: string;
      revenue: number;
    }>;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    channelId: string;
    isMonetized: boolean;
  };
}

export interface AnalyticsReportsResult {
  dailyRevenue: { date: string; revenue: number }[];
  totalRevenue: number;
  channelId: string;
}

export interface YouTubeSetThumbnailResult {
  success: boolean;
  status: string;
  message?: string;
  thumbnails?: {
    default?: { url?: string; width?: number; height?: number };
    medium?: { url?: string; width?: number; height?: number };
    high?: { url?: string; width?: number; height?: number };
    standard?: { url?: string; width?: number; height?: number };
    maxres?: { url?: string; width?: number; height?: number };
  }[];
  error?: string;
}

export interface YouTubeVideo {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
      standard: {
        url: string;
        width: number;
        height: number;
      };
      maxres: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: Record<string, unknown>;
    projection: string;
    hasCustomThumbnail: boolean;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
    selfDeclaredMadeForKids: boolean;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  player: {
    embedHtml: string;
  };
}

export type YouTubeChannelVideoListResult = {
  success: boolean;
  status: string;
  message?: string;
  videos: YouTubeVideo[];
};

export interface YouTubeChannelResponse {
  success: boolean;
  channels: any[] | null;
  tokenStatus: "valid" | "invalid" | "missing_param" | "api_error" | "error";
  error?: string;
  details?: string;
}

export interface YoutubeStatus {
  data: {
    status: "valid" | "invalid" | "error";
    artistAccountId: string;
    error?: string;
  };
  isLoading: boolean;
  error: Error | null;
}