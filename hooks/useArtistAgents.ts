import { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { SOCIAL } from "@/types/Agent";
import { useEffect, useState } from "react";

const useArtistAgents = () => {
  const [agents, setAgents] = useState<ArtistAgent[]>([]);
  const { selectedArtist } = useArtistProvider();

  useEffect(() => {
    const getAgents = async () => {
      if (selectedArtist) {
        const socialIds = selectedArtist.account_socials?.map((social: SOCIAL) => social.id);
        const queryString = socialIds?.map(id => `socialId=${id}`).join("&");
        const response = await fetch(`/api/agents?${queryString}`);
        const data = await response.json();
        if (data.error) return;
        setAgents(data);
      }
    };
    getAgents();
  }, [selectedArtist]);

  return {
    agents,
  };
};

export default useArtistAgents;
