export const codeExamples = {
  curl: `curl -X GET "https://api.recoupable.com/api/account" \\
  -H "Content-Type: application/json" \\
  -d '{"accountId": "YOUR_ACCOUNT_ID"}'`,
  python: `import requests

headers = {
    "Content-Type": "application/json"
}

params = {
    "accountId": "YOUR_ACCOUNT_ID"
}

response = requests.get("https://api.recoupable.com/api/account", headers=headers, params=params)
data = response.json()`,
  javascript: `fetch("https://api.recoupable.com/api/account?accountId=YOUR_ACCOUNT_ID", {
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
  typescript: `interface SocialAccount {
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

interface AccountSocialsResponse {
  status: string;
  socials: SocialAccount[];
}

const fetchAccountSocials = async (accountId: string) => {
  const response = await fetch(\`https://api.recoupable.com/api/account?accountId=\${accountId}\`, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data: AccountSocialsResponse = await response.json();
  return data;
};`,
} as const;

export const exampleResponse = {
  status: "success",
  socials: [
    {
      id: "abc123",
      username: "@example_user",
      avatar: "https://example.com/avatar.jpg",
      profile_url: "https://twitter.com/example_user",
      region: "US",
      bio: "Digital creator and tech enthusiast",
      followerCount: 1234,
      followingCount: 567,
      updated_at: "2024-02-05T15:33:27Z",
    },
    {
      id: "def456",
      username: "example.user",
      avatar: "https://example.com/avatar2.jpg",
      profile_url: "https://instagram.com/example.user",
      region: "UK",
      bio: "Photography & Art 📸",
      followerCount: 5678,
      followingCount: 432,
      updated_at: "2024-02-05T15:33:27Z",
    },
  ],
} as const;

export const responseProperties = [
  {
    name: "status",
    type: "string",
    description: 'Status of the request ("success" or "error")',
  },
  {
    name: "socials",
    type: "array",
    description: "List of social media accounts associated with the account",
  },
  {
    name: "socials[].id",
    type: "string",
    description: "Unique identifier for the social account",
  },
  {
    name: "socials[].username",
    type: "string",
    description: "Username or handle on the platform",
  },
  {
    name: "socials[].avatar",
    type: "string",
    description: "URL to the user's avatar/profile image",
  },
  {
    name: "socials[].profile_url",
    type: "string",
    description: "Full URL to the user's profile on the platform",
  },
  {
    name: "socials[].region",
    type: "string",
    description: "Geographic region or location of the account",
  },
  {
    name: "socials[].bio",
    type: "string",
    description: "User's biography or profile description",
  },
  {
    name: "socials[].followerCount",
    type: "number",
    description: "Number of followers",
  },
  {
    name: "socials[].followingCount",
    type: "number",
    description: "Number of accounts following",
  },
  {
    name: "socials[].updated_at",
    type: "string",
    description: "ISO timestamp of last update",
  },
] as const;
