import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const useTrackEmail = () => {
  const searchParams = useSearchParams();
  const [trackId, setTrackId] = useState("");

  useEffect(() => {
    const init = async () => {
      const email = searchParams.get("email");
      if (!email) return;
      try {
        const response = await fetch(`${getClientApiBaseUrl()}/api/email`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) return;
        const data = (await response.json()) as { id?: string };
        if (data.id) setTrackId(data.id);
      } catch {
        // tracking is fire-and-forget; don't break the page if Loops/api is down
      }
    };
    if (!searchParams) return;
    init();
  }, [searchParams]);

  return {
    trackId,
  };
};

export default useTrackEmail;
