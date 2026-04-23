import { useQuery } from "@tanstack/react-query";
import { getArtistSocials } from "@/lib/api/artist/getArtistSocials";
import { useArtistProvider } from "@/providers/ArtistProvider";

export function useArtistSocials() {
  const { selectedArtist } = useArtistProvider();
  const artist_account_id = selectedArtist?.account_id;
  const { data: socialsData } = useQuery({
    queryKey: ["artistSocials", artist_account_id],
    queryFn: () =>
      artist_account_id
        ? getArtistSocials(artist_account_id)
        : Promise.resolve(undefined),
    enabled: !!artist_account_id,
    staleTime: 1000 * 60 * 5,
  });

  const hasInstagram =
    socialsData?.socials?.some((s) =>
      s.profile_url?.toLowerCase().includes("instagram.com")
    ) ?? false;

  return { socialsData, hasInstagram };
}
