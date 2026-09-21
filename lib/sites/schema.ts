import { z } from "zod";

export const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "Use an HTTPS link");
export const assetSchema = z.object({
  url: httpsUrl,
  name: z.string().max(200),
  type: z.enum(["image", "audio"]),
});
export const experienceSchema = z.object({
  html: z.string().min(1).max(60000),
  css: z.string().max(40000),
  javascript: z.string().max(80000),
});
export const designSchema = z.object({
  headline: z.string().min(1).max(160),
  eyebrow: z.string().max(100),
  description: z.string().max(1200),
  buttonLabel: z.string().max(50),
  signupHeading: z.string().max(100),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  layout: z.enum(["editorial", "poster", "split"]),
  font: z.enum(["serif", "sans"]),
  experience: experienceSchema.optional(),
});
export const siteInputSchema = z
  .object({
    organizationId: z.string().uuid().nullable().default(null),
    artistId: z.string().uuid().nullable().default(null),
    name: z.string().trim().max(120).default(""),
    brief: z.string().trim().max(6000).default(""),
    releaseUrl: z.union([httpsUrl, z.literal("")]).default(""),
    assets: z.array(assetSchema).max(8).default([]),
  })
  .strict()
  .refine((input) => Boolean(input.releaseUrl || (input.name && input.brief)), {
    message: "Add a Spotify link, or a name and brief.",
  });
export const actionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("generate"),
      revision: z.number().int().nonnegative(),
      instruction: z.string().trim().min(1).max(6000),
    })
    .strict(),
  z
    .object({
      action: z.literal("publish"),
      revision: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      action: z.literal("unpublish"),
      revision: z.number().int().nonnegative(),
    })
    .strict(),
]);
export type SiteDesign = z.infer<typeof designSchema>;
export type SiteAsset = z.infer<typeof assetSchema>;
export type SiteSnapshot = {
  production?: {
    status: "reviewed" | "needs-review";
    reviews: { summary: string }[];
  };
  name: string;
  releaseUrl: string;
  assets: SiteAsset[];
  design: SiteDesign;
};
export type Site = {
  id: string;
  owner_id: string;
  created_by: string;
  artist_id: string | null;
  name: string;
  brief: string;
  release_url: string;
  assets: SiteAsset[];
  draft: SiteSnapshot | null;
  published: SiteSnapshot | null;
  revision: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const playerThemeSchema = z.object({
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  font: z.enum(["serif", "sans"]),
  title: z.string().max(120),
  artwork: z.union([httpsUrl, z.literal("")]),
});
export type PlayerTheme = z.infer<typeof playerThemeSchema>;
