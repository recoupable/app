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
    // `images.domains` was deprecated in Next 16 in favour of `remotePatterns`,
    // which scopes each host by protocol and path instead of trusting it over
    // any scheme. Every former `domains` entry is listed here; the set of hosts
    // we will load images from is unchanged.
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
      // Migrated from `images.domains`.
      { protocol: 'https', hostname: 'i.imgur.com', port: '', pathname: '/**' },
      // Twitter profile images + media
      { protocol: 'https', hostname: 'pbs.twimg.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'abs.twimg.com', port: '', pathname: '/**' },
      // Discord
      { protocol: 'https', hostname: 'cdn.discordapp.com', port: '', pathname: '/**' },
      // Facebook
      { protocol: 'https', hostname: 'scontent.xx.fbcdn.net', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com', port: '', pathname: '/**' },
      // Instagram
      { protocol: 'https', hostname: 'scontent.cdninstagram.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'instagram.fyvr4-1.fna.fbcdn.net', port: '', pathname: '/**' },
      // Twitch
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net', port: '', pathname: '/**' },
      // YouTube
      { protocol: 'https', hostname: 'yt3.ggpht.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', port: '', pathname: '/**' },
      // GitHub
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: '', pathname: '/**' },
      // Fal AI image hosting (backup)
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/**' },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
