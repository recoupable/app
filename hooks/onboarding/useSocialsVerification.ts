"use client";

import { useCallback, useMemo, useState } from "react";
import { applySocialVerdict } from "@/lib/onboarding/applySocialVerdict";
import { areAllArtistsResolved } from "@/lib/onboarding/areAllArtistsResolved";
import { isArtistSocialsResolved } from "@/lib/onboarding/isArtistSocialsResolved";
import { markArtistHasNoSocials } from "@/lib/onboarding/markArtistHasNoSocials";
import type {
  SocialsVerificationState,
  SocialVerdict,
} from "@/lib/onboarding/socialVerificationTypes";
import type { ArtistRecord } from "@/types/Artist";

/**
 * Owns the confirm/reject/none verdict state for the socials
 * verification step, plus the per-artist and step-level resolution
 * predicates derived from the live roster.
 */
export function useSocialsVerification(artists: ArtistRecord[]) {
  const [state, setState] = useState<SocialsVerificationState>({});

  const setVerdict = useCallback(
    (artistId: string, socialId: string, verdict: SocialVerdict) => {
      setState((prev) => applySocialVerdict(prev, artistId, socialId, verdict));
    },
    [],
  );

  const markNone = useCallback((artistId: string) => {
    setState((prev) => markArtistHasNoSocials(prev, artistId));
  }, []);

  const artistSocialIds = useMemo(
    () =>
      artists.map((artist) => ({
        artistId: artist.account_id,
        socialIds: (artist.account_socials ?? []).map((social) => social.id),
      })),
    [artists],
  );

  const allResolved = useMemo(
    () => areAllArtistsResolved(state, artistSocialIds),
    [state, artistSocialIds],
  );

  const isResolved = useCallback(
    (artist: ArtistRecord) =>
      isArtistSocialsResolved(
        state[artist.account_id],
        (artist.account_socials ?? []).map((social) => social.id),
      ),
    [state],
  );

  return { state, setVerdict, markNone, isResolved, allResolved };
}
