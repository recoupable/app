/** Options for {@link useVercelChat}'s reload (retry / edit-and-resubmit). */
export type ReloadOptions = {
  /** When true, skip server trailing delete (caller already deleted). */
  skipTrailingDelete?: boolean;
};
