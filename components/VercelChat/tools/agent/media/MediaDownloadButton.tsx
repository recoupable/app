"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadMedia } from "@/lib/chat/downloadMedia";
import { mediaDownloadFilename } from "@/lib/chat/mediaDownloadFilename";

/**
 * Saves a generated asset to disk.
 *
 * A button rather than a link: every asset is cross-origin, where the anchor
 * `download` attribute is ignored and the link would navigate to the file
 * instead of saving it. `downloadMedia` fetches the bytes and saves them
 * through an object URL, which works on both CDNs we serve from.
 *
 * @param url - Absolute media URL from the tool result's stdout.
 */
export function MediaDownloadButton({ url }: { url: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit"
      onClick={() => void downloadMedia(url, mediaDownloadFilename(url))}
    >
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
}
