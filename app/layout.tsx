import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "@/providers/Providers";
import { META_DESCRIPTION, TITLE } from "@/lib/consts";
import Sidebar from "@/components/Sidebar";
import WorkspaceContextBar from "@/components/Chat/WorkspaceContextBar";
import Header from "@/components/Header";
import { Suspense } from "react";
import ArtistSettingModal from "@/components/ArtistSettingModal";
import AddArtistDialog from "@/components/Artists/AddArtistDialog";
import MobileDownloadModal from "@/components/ModalDownloadModal";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import AccountOverrideBadge from "@/components/AccountOverrideBadge";

const dmSans = localFont({
  src: "./fonts/DMSans-Latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-dm-sans",
});

const ibmPlexMono = localFont({
  src: "./fonts/IBMPlexMono-Latin.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#10221E" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: TITLE,
    description: META_DESCRIPTION,
    other: {
      "fc:frame": JSON.stringify({
        version: process.env.NEXT_PUBLIC_VERSION,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `Launch ${TITLE}`,
          action: {
            type: "launch_frame",
            name: TITLE,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
            splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
          },
        },
      }),
    },
    openGraph: {
      title: TITLE,
      description: META_DESCRIPTION,
      images: [
        { url: "/brand/icon-512.png", width: 512, height: 512, alt: TITLE },
      ],
    },
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.ico",
      apple: "/brand/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Suspense>
          <Providers>
            <AccountOverrideBadge />
            <div className="flex flex-col md:flex-row">
              <Sidebar />
              <Header />
              <ArtistSettingModal />
              <AddArtistDialog />
              <div className="min-w-0 grow flex h-[100dvh] pt-16 md:pt-0 md:h-screen overflow-hidden bg-sidebar">
                <div className="size-full md:p-3 md:pl-0">
                  <div className="size-full bg-card overflow-y-auto md:rounded-[24px] flex flex-col md:shadow-[0_0_0_1px_var(--border),0_8px_32px_var(--surface-shadow)]">
                    <WorkspaceContextBar />
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {children}
                    </div>
                  </div>
                </div>
              </div>
              <MobileDownloadModal />
            </div>
            <ToastContainer />
            <Toaster />
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
