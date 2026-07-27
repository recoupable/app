// next.config.mjs

import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  serverExternalPackages: ['@browserbasehq/stagehand', 'playwright'],
  // The interim `/onboarding/*` mounts (chat#1880) were scaffolding so each
  // step was user-testable before the sequence container existed. `/setup/*`
  // is now the canonical sequence (chat#1889), so they are retired here.
  //
  // Config redirects rather than `redirect()` page components: Next prerenders
  // such a page and ships the redirect in its RSC payload, so the old URL
  // answers HTTP 200 to any non-JS client (crawler, link previewer, curl) and
  // only redirects once React hydrates. These are real 308s at the edge, and
  // they leave no page files behind to forget to delete.
  redirects() {
    return [
      {
        source: "/onboarding/first-task",
        destination: "/setup/tasks",
        permanent: true,
      },
      {
        source: "/onboarding/roster",
        destination: "/setup/artists",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'date-fns',
    ],
  },
  images: {
    domains: [
      "i.imgur.com",
      "ipfs.decentralized-content.com",
      "pbs.twimg.com", // Twitter profile images
      "abs.twimg.com", // Twitter media
      "cdn.discordapp.com", // Discord
      "scontent.xx.fbcdn.net", // Facebook
      "scontent.cdninstagram.com", // Instagram
      "instagram.fyvr4-1.fna.fbcdn.net", // Instagram
      "platform-lookaside.fbsbx.com", // Facebook
      "static-cdn.jtvnw.net", // Twitch
      "yt3.ggpht.com", // YouTube
      "i.ytimg.com", // YouTube
      "avatars.githubusercontent.com", // GitHub
      "example.com", // Example domain from our mock data
      "arweave.net", // Arweave
      "storage.googleapis.com", // Fal AI image hosting (backup)
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fal.media',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.decentralized-content.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
