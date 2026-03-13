interface FetchPostsParams {
  artistAccountId: string;
  page?: number;
  limit?: number;
}

export interface Post {
  id: string;
  post_url: string;
  updated_at: string;
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

/**
 * Fetches posts for a specific artist from the API
 *
 * @param root0
 * @param root0.artistAccountId
 * @param root0.page
 * @param root0.limit
 */
async function fetchPosts({
  artistAccountId,
  page = 1,
  limit = 20,
}: FetchPostsParams): Promise<PostsResponse> {
  try {
    const url = new URL("https://api.recoupable.com/api/posts");
    url.searchParams.append("artist_account_id", artistAccountId);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString());

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
