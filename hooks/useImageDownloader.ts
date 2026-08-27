import { useState, useEffect } from "react";

interface UseImageDownloaderOptions {
  imageUrl: string | null;
  enabled?: boolean;
}

export function useImageDownloader({ imageUrl, enabled = true }: UseImageDownloaderOptions) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);

  // Prefetch the image when component mounts or imageUrl changes
  useEffect(() => {
    if (!imageUrl || !enabled) return;

    const prefetchImage = async () => {
      setIsPrefetching(true);
      try {
        const response = await fetch(imageUrl as string);
        const blob = await response.blob();
        setImageBlob(blob);
      } catch (error) {
        console.error("Error prefetching image:", error);
      } finally {
        setIsPrefetching(false);
      }
    };
    
    prefetchImage();
  }, [imageUrl, enabled]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    setIsDownloading(true);
    
    try {
      // Use prefetched blob if available, otherwise fetch it
      const blob = imageBlob || await (async () => {
        const response = await fetch(imageUrl as string);
        return response.blob();
      })();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Format: "Recoup Image May 15, 2025, 09_59_47 PM"
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const formattedTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }).replace(/:/g, '_');
      link.download = `Recoup Image ${formattedDate}, ${formattedTime}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    imageBlob,
    isDownloading,
    isPrefetching,
    isReady: !!imageBlob,
    handleDownload
  };
} 