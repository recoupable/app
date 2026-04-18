// next.config.mjs

import withPWA from "next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  serverExternalPackages: ['@browserbasehq/stagehand', 'playwright'],
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
      "pbs.twimg.com",
      "abs.twimg.com",
      "cdn.discordapp.com",
      "scontent.xx.fbcdn.net",
      "scontent.cdninstagram.com",
      "instagram.fyvr4-1.fna.fbcdn.net",
      "platform-lookaside.fbsbx.com",
      "static-cdn.jtvnw.net",
      "yt3.ggpht.com",
      "i.ytimg.com",
      "avatars.githubusercontent.com",
      "example.com",
      "arweave.net",
      "storage.googleapis.com",
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

export default withNextIntl(
  withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })(nextConfig)
);