import type { ReleasePlanFixture } from "@/lib/intelligent-ui/playground/release-plan/types";
import { OFFSET_RANGE_LABEL } from "@/lib/intelligent-ui/playground/release-plan/limits";
interface Props {
  fixture: ReleasePlanFixture;
  version: number;
}
export default function ReleasePlanHeader({ fixture, version }: Props) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Plan {fixture.label}</h2>
        <p className="text-sm leading-6">
          Edit dates, review what would move, then save a local version in this
          tab. This synthetic plan does not approve tasks or schedule a release.
        </p>
        <p className="text-sm text-muted-foreground">
          {fixture.scope.workspaceId} / {fixture.scope.releaseId} · worksheet
          revision {fixture.scope.sourceRevision} · local version{" "}
          {version || "not saved"}
        </p>
      </div>
      <details>
        <summary className="min-h-11 cursor-pointer py-2 text-sm">
          Source and date rules
        </summary>
        <div className="space-y-3 text-sm leading-6">
          <p>{fixture.sourceText}</p>
          <p>
            The starting goal, date, timezone and offsets are authored planning
            examples, not claims from the worksheet. All dates are Gregorian
            calendar dates in the named IANA timezone. Offsets count calendar
            days, including weekends. No clock time is scheduled; timezone
            changes do not shift dates. DST does not add or subtract a planning
            day.
          </p>
          <p>
            Offsets range from {OFFSET_RANGE_LABEL} days. A task anchored to
            another task must not precede it; these preparation tasks must not
            fall after release. Dependencies must not form a cycle. Manual dates
            override offsets and remain fixed when dates change.
          </p>
        </div>
      </details>
    </>
  );
}
