import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "@/providers/Providers";
import { META_DESCRIPTION, TITLE } from "@/lib/consts";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Suspense } from "react";
import ArtistSettingModal from "@/components/ArtistSettingModal";
import MobileDownloadModal from "@/components/ModalDownloadModal";
import ArtistsSidebar from "@/components/Artists/ArtistsSidebar";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import DeferredAnalytics from "@/components/DeferredAnalytics";
import AccountOverrideBadge from "@/components/AccountOverrideBadge";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      images: "/backgrounds/marketing_screenshot.png",
    },
    manifest: "/manifest.json",
    icons: [{ rel: "icon", url: "/icon-with-background.png" }],
    viewport:
      "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
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
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className={`${geist.variable} antialiased`}>
        <Suspense>
          <Providers>
            <AccountOverrideBadge />
            <div className="flex flex-col md:flex-row">
              <Sidebar />
              <Header />
              <ArtistSettingModal />
              <div className="grow flex h-[100dvh] pt-16 md:pt-0 md:h-screen overflow-hidden bg-sidebar">
                <div className="size-full md:py-4 md:pl-4">
                  <div className="size-full bg-card overflow-y-auto md:rounded-xl flex flex-col md:shadow-md md:border md:border-border">
                    {children}
                  </div>
                </div>
                <ArtistsSidebar />
              </div>
              <MobileDownloadModal />
            </div>
            <ToastContainer />
            <Toaster />
          </Providers>
        </Suspense>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
