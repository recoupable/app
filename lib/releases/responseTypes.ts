import type {
  CompanyAssessmentBrief,
  CompanyAssessmentSnapshot,
} from "./assessmentTypes";
import type { ReleaseCase, ReleaseCaseItem } from "./types";

export interface ReleaseCaseResponses {
  brief: CompanyAssessmentBrief;
  save_brief: { snapshot: CompanyAssessmentSnapshot };
  read_brief: { snapshot: CompanyAssessmentSnapshot };
  ingest_release: { request: { id: string; status: string } };
  list_release_cases: {
    cases: ReleaseCaseItem[];
    has_more: boolean;
    next_id: string | null;
  };
  read_release_case: ReleaseCase;
  review_release_case: unknown;
}
