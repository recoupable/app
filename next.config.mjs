// next.config.mjs

import path from "node:path";
import { fileURLToPath } from "node:url";
import withPWA from "next-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  serverExternalPackages: ['@browserbasehq/stagehand', 'playwright'],
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./lib/shims/async-storage-web-stub.js",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@react-native-async-storage/async-storage": path.join(
          __dirname,
          "lib/shims/async-storage-web-stub.js",
        ),
      };
    }
    return config;
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
