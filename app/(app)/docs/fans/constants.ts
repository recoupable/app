export const codeExamples = {
  curl: `curl -X GET "https://api.recoupable.com/api/fans?artist_account_id=YOUR_ARTIST_ACCOUNT_ID&page=1&limit=20" \\
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

response = requests.get("https://api.recoupable.com/api/fans", headers=headers, params=params)
data = response.json()`,
  javascript: `fetch("https://api.recoupable.com/api/fans?artist_account_id=YOUR_ARTIST_ACCOUNT_ID&page=1&limit=20", {
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
  typescript: `interface Social {
  id: string;
  username: string;
  avatar: string;
  profile_url: string;
  region: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  updated_at: string;
}

interface FansResponse {
  status: string;
  fans: Social[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

const fetchArtistFans = async (
  artistAccountId: string, 
  page: number = 1, 
  limit: number = 20
) => {
  const response = await fetch(
    \`https://api.recoupable.com/api/fans?artist_account_id=\${artistAccountId}&page=\${page}&limit=\${limit}\`, 
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  const data: FansResponse = await response.json();
  return data;
};`,
} as const;

export const exampleResponse = {
  status: "success",
  fans: [
    {
      id: "fan123",
      username: "@superfan",
      avatar: "https://example.com/avatar1.jpg",
      profile_url: "https://twitter.com/superfan",
      region: "US",
      bio: "Music lover and digital art collector",
      followerCount: 1234,
      followingCount: 567,
      updated_at: "2024-03-06T15:33:27Z",
    },
    {
      id: "fan456",
      username: "artcollector",
      avatar: "https://example.com/avatar2.jpg",
      profile_url: "https://instagram.com/artcollector",
      region: "UK",
      bio: "Supporting emerging artists 🎨",
      followerCount: 5678,
      followingCount: 432,
      updated_at: "2024-03-06T12:22:15Z",
    },
  ],
  pagination: {
    total_count: 156,
    page: 1,
    limit: 20,
    total_pages: 8,
  },
} as const;

export const responseProperties = [
  {
    name: "status",
    type: "string",
    description: 'Status of the request ("success" or "error")',
  },
  {
    name: "fans",
    type: "array",
    description: "List of social profiles from fans across all platforms",
  },
  {
    name: "fans[].id",
    type: "string",
    description: "Unique identifier for the fan's social profile",
  },
  {
    name: "fans[].username",
    type: "string",
    description: "Username or handle on the platform",
  },
  {
    name: "fans[].avatar",
    type: "string",
    description: "URL to the fan's avatar/profile image",
  },
  {
    name: "fans[].profile_url",
    type: "string",
    description: "Full URL to the fan's profile on the platform",
  },
  {
    name: "fans[].region",
    type: "string",
    description: "Geographic region or location of the fan",
  },
  {
    name: "fans[].bio",
    type: "string",
    description: "Fan's biography or profile description",
  },
  {
    name: "fans[].followerCount",
    type: "number",
    description: "Number of followers the fan has",
  },
  {
    name: "fans[].followingCount",
    type: "number",
    description: "Number of accounts the fan is following",
  },
  {
    name: "fans[].updated_at",
    type: "string",
    description: "ISO timestamp of when the fan data was last updated",
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
