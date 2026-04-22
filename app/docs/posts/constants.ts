export const codeExamples = {
  curl: `curl -X GET "https://api.recoupable.com/api/posts?artist_account_id=YOUR_ARTIST_ACCOUNT_ID&page=1&limit=20" \\
  -H "Content-Type: application/json"`,
  python: `import requests

headers = {
    "Content-Type": "application/json"
}

params = {
    "artist_account_id": "YOUR_ARTIST_ACCOUNT_ID",
    "page": 1,
    "limit": 20
}

response = requests.get("https://api.recoupable.com/api/posts", headers=headers, params=params)
data = response.json()`,
  javascript: `fetch("https://api.recoupable.com/api/posts?artist_account_id=YOUR_ARTIST_ACCOUNT_ID&page=1&limit=20", {
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
  typescript: `interface Post {
  id: string;
  post_url: string;
  updated_at: string;
}

interface PostsResponse {
  status: string;
  posts: Post[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

const fetchArtistPosts = async (
  artistAccountId: string, 
  page: number = 1, 
  limit: number = 20
) => {
  const response = await fetch(
    \`https://api.recoupable.com/api/posts?artist_account_id=\${artistAccountId}&page=\${page}&limit=\${limit}\`, 
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  const data: PostsResponse = await response.json();
  return data;
};`,
} as const;

export const exampleResponse = {
  status: "success",
  posts: [
    {
      id: "post123",
      post_url: "https://twitter.com/artist/status/123456789",
      updated_at: "2024-03-06T15:33:27Z",
    },
    {
      id: "post456",
      post_url: "https://instagram.com/p/abc123",
      updated_at: "2024-03-05T18:22:15Z",
    },
  ],
  pagination: {
    total_count: 42,
    page: 1,
    limit: 20,
    total_pages: 3,
  },
} as const;

export const responseProperties = [
  {
    name: "status",
    type: "string",
    description: 'Status of the request ("success" or "error")',
  },
  {
    name: "posts",
    type: "array",
    description: "List of posts from the artist across all social platforms",
  },
  {
    name: "posts[].id",
    type: "string",
    description: "Unique identifier for the post",
  },
  {
    name: "posts[].post_url",
    type: "string",
    description: "Direct URL to the post on the social platform",
  },
  {
    name: "posts[].updated_at",
    type: "string",
    description: "ISO timestamp of when the post was last updated",
  },
  {
    name: "pagination",
    type: "object",
    description: "Pagination metadata for the response",
  },
  {
    name: "pagination.total_count",
    type: "number",
    description: "Total number of records available",
  },
  {
    name: "pagination.page",
    type: "number",
    description: "Current page number",
  },
  {
    name: "pagination.limit",
    type: "number",
    description: "Number of records per page",
  },
  {
    name: "pagination.total_pages",
    type: "number",
    description: "Total number of pages available",
  },
] as const;
