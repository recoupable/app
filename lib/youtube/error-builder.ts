import {
  APIErrorResponse,
  APISuccessResponse,
  AuthStatusErrorResponse,
  AuthStatusSuccessResponse,
  ToolErrorResponse,
  ToolSuccessResponse,
  UtilitySuccessResponse,
} from "@/types/youtube";
import { NextResponse } from "next/server";

/**
 * YouTube Error Response Builder
 * Centralized utility for creating consistent error responses across YouTube integration
 */
export class YouTubeErrorBuilder {
  /**
   * Create tool error response (for MCP tools)
   *
   * @param message
   */
  static createToolError(message: string): ToolErrorResponse {
    return {
      success: false,
      status: "error",
      message,
    };
  }

  /**
   * Create authentication status error response
   *
   * @param message
   */
  static createAuthStatusError(message: string): AuthStatusErrorResponse {
    return {
      authenticated: false,
      message,
    };
  }

  /**
   * Create API route error response (NextResponse)
   *
   * @param message
   */
  static createAPIError(message: string): NextResponse<APIErrorResponse> {
    return NextResponse.json({
      success: false,
      status: "error",
      message,
    });
  }

  /**
   * Create utility function error response (with error codes)
   *
   * @param code
   * @param message
   */
  static createUtilityError<T extends string>(
    code: T,
    message: string,
  ): {
    success: false;
    error: {
      code: T;
      message: string;
    };
  } {
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }

  /**
   * Create tool success response
   *
   * @param message
   * @param data
   */
  static createToolSuccess<T extends Record<string, unknown>>(
    message: string,
    data?: T,
  ): ToolSuccessResponse & Partial<T> {
    return {
      success: true,
      status: "success",
      message,
      ...(data || ({} as T)),
    };
  }

  /**
   * Create authentication status success response
   *
   * @param message
   * @param expiresAt
   * @param createdAt
   */
  static createAuthStatusSuccess(
    message: string,
    expiresAt?: string,
    createdAt?: string,
  ): AuthStatusSuccessResponse {
    return {
      authenticated: true,
      message,
      ...(expiresAt && { expiresAt }),
      ...(createdAt && { createdAt }),
    };
  }

  /**
   * Create API route success response (NextResponse)
   *
   * @param message
   * @param data
   */
  static createAPISuccess<T extends Record<string, unknown>>(
    message: string,
    data: T,
  ): NextResponse<APISuccessResponse & T> {
    return NextResponse.json({
      success: true,
      status: "success",
      message,
      ...data,
    });
  }

  /**
   * Create utility function success response
   *
   * @param data
   */
  static createUtilitySuccess<T extends Record<string, unknown>>(
    data: T,
  ): UtilitySuccessResponse & T {
    return {
      success: true,
      ...data,
    };
  }
}

// Predefined error messages for consistency
export const YouTubeErrorMessages = {
  // Common validation errors
  NO_ACCOUNT_ID: "Account ID is required",
  NO_TOKENS: "No YouTube tokens found for this account. Please authenticate first.",
  EXPIRED_TOKENS: "YouTube access token has expired for this account. Please re-authenticate.",
  EXPIRED_TOKENS_NO_REFRESH:
    "YouTube access token has expired, and no refresh token is available. Please re-authenticate.",
  FETCH_ERROR: "Failed to validate YouTube tokens. Please try again.",
  DB_UPDATE_FAILED: "Failed to save refreshed YouTube token to the database.",

  // Token Refresh Specific Errors
  REFRESH_INCOMPLETE_CREDENTIALS:
    "Failed to refresh token: incomplete credentials received from Google.",
  REFRESH_GENERAL_FAILURE: "Failed to refresh YouTube token. Please try re-authenticating.",
  REFRESH_INVALID_GRANT:
    "YouTube refresh token is invalid or has been revoked. Please re-authenticate your YouTube account.",

  // API specific errors
  NO_CHANNELS: "No YouTube channels found for this authenticated account",
  API_ERROR: "Failed to fetch YouTube channel information",
  AUTH_FAILED: "YouTube authentication failed. Please sign in again.",

  // Monetization specific errors
  INSUFFICIENT_SCOPE:
    "YouTube Analytics access required. Please re-authenticate with Analytics permissions.",
  ANALYTICS_ERROR: "Failed to fetch YouTube Analytics data. Please try again.",
  CHANNEL_NOT_FOUND: "Channel not found or not accessible for Analytics.",

  // Generic errors
  GENERAL_ERROR: "An unexpected error occurred",
  STATUS_CHECK_FAILED: "Failed to check YouTube authentication status",
};
