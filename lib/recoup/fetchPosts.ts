import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Post } from "@/types/Post";

interface FetchPostsParams {
  artistAccountId: string;
  accessToken: string;
  page?: number;
  limit?: number;
}

export interface PostsResponse {
  status: string;
  posts: Post[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface PostsError {
  message: string;
  status?: number;
}

async function fetchPosts({
  artistAccountId,
  accessToken,
  page = 1,
  limit = 20,
}: FetchPostsParams): Promise<PostsResponse> {
  try {
    const url = new URL(
      `${getClientApiBaseUrl()}/api/artists/${artistAccountId}/posts?page=${page}&limit=${limit}`,
    );

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error: PostsError = {
        message: "Failed to fetch posts",
        status: response.status,
      };
      throw error;
    }

    const data: PostsResponse = await response.json();

    if (data.status !== "success") {
      throw { message: "API returned error status" } as PostsError;
    }

    return data;
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      throw error;
    }
    throw { message: "An unexpected error occurred" } as PostsError;
  }
}

export default fetchPosts;
