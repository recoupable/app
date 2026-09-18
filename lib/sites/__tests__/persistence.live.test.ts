import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { insertSite } from "@/lib/supabase/sites/insertSite";
import { updateSite } from "@/lib/supabase/sites/updateSite";
import { selectSignups } from "@/lib/supabase/sites/selectSignups";
import { GET } from "@/app/s/[id]/route";
import { POST } from "@/app/s/[id]/signup/route";
import type { SiteSnapshot } from "../schema";

// Opt-in integration check. Creates only disposable test data, then removes it.
it.skipIf(process.env.SITES_DB_TEST !== "1")(
  "persists drafts, publishes, captures consent, and unpublishes",
  async () => {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const owner = randomUUID();
    const account = await db.from("accounts").insert({ id: owner });
    if (account.error) throw account.error;
    let siteId: string | undefined;
    try {
      const site = await insertSite({
        owner_id: owner,
        created_by: owner,
        artist_id: null,
        name: "Sites integration test",
        brief: "Disposable test",
        release_url: "",
        assets: [],
      });
      siteId = site.id;
      const context = { params: Promise.resolve({ id: site.id }) };
      const request = new Request(`http://localhost/s/${site.id}`);
      expect((await GET(request, context)).status).toBe(404);
      const snapshot: SiteSnapshot = {
        name: site.name,
        releaseUrl: "",
        assets: [],
        design: {
          headline: "Integration test",
          eyebrow: "Test",
          description: "Disposable test page",
          buttonLabel: "Listen",
          signupHeading: "Updates",
          background: "#ffffff",
          foreground: "#111111",
          accent: "#ccff44",
          layout: "editorial",
          font: "sans",
        },
      };
      const draft = await updateSite(site.id, owner, site.revision, {
        draft: snapshot,
      });
      expect(draft?.draft).toEqual(snapshot);
      expect(
        await updateSite(site.id, owner, site.revision, { draft: snapshot }),
      ).toBeNull();
      const published = await updateSite(site.id, owner, draft!.revision, {
        published: snapshot,
        published_at: new Date().toISOString(),
      });
      const page = await GET(request, context);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain("Integration test");
      for (let i = 0; i < 2; i++) {
        const body = new FormData();
        body.set("email", "sites-test@example.com");
        body.set("consent", "yes");
        expect(
          (
            await POST(
              new Request(`http://localhost/s/${site.id}/signup`, {
                method: "POST",
                body,
              }),
              context,
            )
          ).status,
        ).toBe(200);
      }
      expect(await selectSignups(site.id)).toHaveLength(1);
      const consent = await db
        .from("site_signups")
        .select("consent_text")
        .eq("site_id", site.id)
        .single();
      expect(consent.data?.consent_text).toContain(site.name);
      const anon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      expect(
        (await anon.from("sites").select("id").eq("id", site.id)).error,
      ).toBeTruthy();
      expect(
        (await anon.from("site_signups").select("email").eq("site_id", site.id))
          .error,
      ).toBeTruthy();
      await updateSite(site.id, owner, published!.revision, {
        published: null,
        published_at: null,
      });
      expect((await GET(request, context)).status).toBe(404);
    } finally {
      if (siteId) {
        const result = await db.from("sites").delete().eq("id", siteId);
        if (result.error) throw result.error;
      }
      const result = await db.from("accounts").delete().eq("id", owner);
      if (result.error) throw result.error;
    }
  },
  30000,
);
