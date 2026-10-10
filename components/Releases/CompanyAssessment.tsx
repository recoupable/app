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
      className="space-y-4 rounded-xl p-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Company assessment"
    >
      <h2 className="text-xl font-semibold">Company assessment</h2>
      <p className="text-sm text-muted-foreground">
        Review this release’s saved evidence and missing coverage. This is a
        partial assessment, not verified rights or a complete company inventory.
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
          <p className="text-sm">Coverage: {assessment.brief.readiness}</p>
          <p className="whitespace-pre-wrap text-sm">{assessment.brief.text}</p>
          <h3 className="font-medium">Next review steps</h3>
          <p className="text-sm">{assessment.brief.guidance}</p>
          <ul className="list-disc pl-5 text-sm">
            {assessment.brief.missingTopics.map((topic) => (
              <li key={topic}>{topic.replaceAll("_", " ")}</li>
            ))}
          </ul>
        </div>
      )}
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
      {assessment.notice && (
        <p role="status" className="text-sm">
          {assessment.notice}
        </p>
      )}
    </section>
  );
}
