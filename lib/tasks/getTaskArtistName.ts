interface RosterArtist {
  account_id: string;
  name: string | null;
}

/**
 * The display name of the artist a task belongs to, from the roster the
 * artist provider already holds. The Schedules tab is account-wide, so a
 * row has to say which artist it is for (chat#2006 item 6). Null when the
 * artist is not on the roster.
 */
export function getTaskArtistName(
  task: { artist_account_id: string },
  roster: ReadonlyArray<RosterArtist>,
): string | null {
  return (
    roster.find((a) => a.account_id === task.artist_account_id)?.name ?? null
  );
}
