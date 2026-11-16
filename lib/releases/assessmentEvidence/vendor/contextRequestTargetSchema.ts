import { z } from "zod/v4";

export const contextRequestTargetSchema = z.strictObject({
  subjectId: z.uuid(),
  kind: z.enum([
    "artist",
    "songwriter",
    "company",
    "campaign",
    "release",
    "recording",
    "composition",
    "catalog",
    "material",
    "video",
  ]),
  identityConfirmed: z.boolean(),
  availableFields: z.array(
    z.enum([
      "isrc",
      "spotify_id",
      "title",
      "mlc_work_code",
      "artist_account_link",
      "catalog_account_link",
    ]),
  ),
  reusableModules: z.array(z.string()),
});
