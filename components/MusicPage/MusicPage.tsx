"use client";

import { MusicPageHeader } from "./MusicPageHeader";
import MusicGallery from "./MusicGallery";

const MusicPage = () => {
  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <MusicPageHeader />
      <MusicGallery />
    </div>
  );
};

export default MusicPage;
