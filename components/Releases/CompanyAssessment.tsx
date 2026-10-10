"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanyAssessment } from "@/hooks/useCompanyAssessment";
interface Props {
  requestId: string;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}
export default function CompanyAssessment({
  requestId,
  organizationId,
  getAccessToken,
}: Props) {
  const assessment = useCompanyAssessment(
    requestId,
    organizationId,
    getAccessToken,
  );
  return (
    <section
      className="space-y-4 rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Evidence summary"
    >
      <h2 className="text-lg font-semibold">Evidence summary</h2>
      <p className="text-sm text-muted-foreground">
        See what’s saved and what’s missing. Preview a summary, then save a
        version you can return to later.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={assessment.busy}
          onClick={() => void assessment.run("brief")}
        >
          Preview assessment
        </Button>
        <Button
          disabled={
            assessment.busy || !assessment.brief || !!assessment.savedId
          }
          onClick={() => void assessment.run("save_brief")}
        >
          Save assessment
        </Button>
      </div>
      {assessment.brief && (
        <div className="space-y-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">
              {assessment.brief.missingTopics.length
                ? "What’s missing"
                : "Saved evidence is ready to review"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Coverage: {assessment.brief.readiness}. This summary uses saved
              evidence; it doesn’t collect new information.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {assessment.brief.missingTopics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-md bg-background px-2.5 py-1 text-xs shadow-[0_0_0_1px_var(--border)]"
                >
                  {topic.replaceAll("_", " ")}
                </li>
              ))}
            </ul>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              Read summary and citations
            </summary>
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/30 p-4 text-sm leading-relaxed">
              {assessment.brief.text}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {assessment.brief.guidance}
            </p>
          </details>
        </div>
      )}
      <details className="rounded-xl bg-muted/30 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium">
          Open a saved assessment
        </summary>
        <div className="mt-3 space-y-3">
          {assessment.savedId && (
            <p className="break-all text-sm">
              Saved assessment: {assessment.savedId}
            </p>
          )}

          <label className="block text-sm" htmlFor="assessment-id">
            Saved assessment ID
          </label>
          <Input
            id="assessment-id"
            value={assessment.openId}
            onChange={(event) => assessment.setOpenId(event.target.value)}
            placeholder="Paste the saved ID to reopen"
            disabled={assessment.busy}
          />
          <Button
            variant="outline"
            disabled={assessment.busy || !assessment.openId.trim()}
            onClick={() => void assessment.run("read_brief")}
          >
            Open saved assessment
          </Button>
        </div>
      </details>
      {assessment.notice && (
        <p role="status" className="text-sm">
          {assessment.notice}
        </p>
      )}
    </section>
  );
}
