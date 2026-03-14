import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";

export interface MiniApp {
  isMiniApp: boolean;
  isLoading: boolean;
}

export const useMiniApp = (): MiniApp => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    sdk.isInMiniApp().then(isMiniApp => {
      setIsMiniApp(isMiniApp);
      setIsLoading(false);
    });
  }, []);

  return { isMiniApp, isLoading };
};
