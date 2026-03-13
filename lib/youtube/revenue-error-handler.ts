import { YouTubeErrorBuilder } from "./error-builder";
import { YouTubeRevenueResult } from "@/types/youtube";

// One line functions start here
const isApiError = (error: unknown): error is { code: number } =>
  error !== null && typeof error === "object" && "code" in error;

const isForbiddenError = (error: unknown): boolean => isApiError(error) && error.code === 403;

const isUnauthorizedClientError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes("unauthorized_client");

const getErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : "Failed to get YouTube revenue data. Please check your authentication and try again, or channel might not be monetized or have insufficient permissions.";

// One line functions end here

// Actual function definitions start here
export const handleRevenueError = (error: unknown): YouTubeRevenueResult => {
  if (isForbiddenError(error)) {
    return YouTubeErrorBuilder.createToolError(
      "Access denied. Channel may not be monetized or lacks Analytics permissions.",
    );
  }

  if (isUnauthorizedClientError(error)) {
    return YouTubeErrorBuilder.createToolError(
      "Unauthorized client. Please re-authenticate your YouTube account.",
    );
  }

  return YouTubeErrorBuilder.createToolError(getErrorMessage(error));
};
