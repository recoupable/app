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
      const response = await fetch(`${getClientApiBaseUrl()}/api/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      setTrackId(data.id);
    };
    if (!searchParams) return;
    init();
  }, [searchParams]);

  return {
    trackId,
  };
};

export default useTrackEmail;
