import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getArtistSocials } from "@/lib/api/artist/getArtistSocials";
import { useArtistProvider } from "@/providers/ArtistProvider";

export function useArtistSocials() {
  const { selectedArtist } = useArtistProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const artist_account_id = selectedArtist?.account_id;
  const { data: socialsData } = useQuery({
    queryKey: ["artistSocials", artist_account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getArtistSocials(artist_account_id!, accessToken!);
    },
    enabled: !!artist_account_id && authenticated,
    staleTime: 1000 * 60 * 5,
  });

  const hasInstagram =
    socialsData?.socials?.some((s) =>
      s.profile_url?.toLowerCase().includes("instagram.com")
    ) ?? false;

  return { socialsData, hasInstagram };
}
