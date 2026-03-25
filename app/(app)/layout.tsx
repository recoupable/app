import Providers from "@/providers/Providers";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Suspense } from "react";
import ArtistSettingModal from "@/components/ArtistSettingModal";
import MobileDownloadModal from "@/components/ModalDownloadModal";
import ArtistsSidebar from "@/components/Artists/ArtistsSidebar";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <Providers>
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
  );
}
