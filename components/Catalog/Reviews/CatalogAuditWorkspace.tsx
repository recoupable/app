"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCatalogAudit } from "@/hooks/useCatalogAudit";
import CatalogAuditDetails from "./CatalogAuditDetails";

interface Props {
  accountId: string;
  organizationId: string | null;
  apiSelection: string;
  briefId: string | null;
  getAccessToken: () => Promise<string | null>;
}
export default function CatalogAuditWorkspace(props: Props) {
  const audit = useCatalogAudit(props);
  return (
    <div className="grid gap-8 md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="space-y-4" aria-label="Saved audits">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Saved audits</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={audit.busy || audit.uncertain}
            onClick={() => void audit.loadList()}
          >
            Refresh
          </Button>
        </div>
        {!audit.items.length && (
          <p className="text-sm text-muted-foreground">
            Your saved reviews will appear here.
          </p>
        )}
        <ul className="space-y-2">
          {audit.items.map((item) => (
            <li key={item.case_id}>
              <button
                type="button"
                disabled={audit.busy || audit.uncertain}
                aria-current={
                  audit.snapshot?.case_id === item.case_id ? "true" : undefined
                }
                onClick={() => void audit.open(item.case_id)}
                className="w-full rounded-xl p-3 text-left shadow-[0_0_0_1px_var(--border)] hover:bg-muted/50 focus-visible:outline-ring disabled:opacity-50"
              >
                <span className="block text-sm font-medium">
                  Audit {item.case_id.slice(0, 8)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Revision {item.revision} ·{" "}
                  <time dateTime={item.updated_at}>
                    {new Date(item.updated_at).toLocaleDateString()}
                  </time>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {audit.nextId && (
          <Button
            variant="outline"
            disabled={audit.busy || audit.uncertain}
            onClick={() => void audit.loadList(audit.nextId!)}
          >
            Load more audits
          </Button>
        )}
      </aside>
      <section
        className="min-w-0 space-y-5 rounded-2xl bg-background p-5 shadow-[0_0_0_1px_var(--border)] sm:p-6"
        aria-label="Catalog audit"
      >
        {props.briefId && !audit.snapshot && !audit.uncertain && (
          <div className="space-y-3">
            <h2 className="text-xl font-medium">
              Start with your saved assessment
            </h2>
            <p className="text-sm text-muted-foreground">
              Prepare a partial catalog audit with the same summary, evidence
              versions and missing topics. Nothing is saved until you choose
              Save audit.
            </p>
            <Button
              disabled={audit.busy}
              onClick={() => void audit.prepare(props.briefId!)}
            >
              Prepare audit
            </Button>
          </div>
        )}
        {!props.briefId && !audit.snapshot && (
          <div className="space-y-3">
            <h2 className="text-xl font-medium">Pick up a saved review</h2>
            <p className="text-sm text-muted-foreground">
              Open an audit from the list, or start one from a saved assessment
              in Releases.
            </p>
            <Link
              className="text-sm text-brand-link underline"
              href="/releases"
            >
              Go to assessments
            </Link>
          </div>
        )}
        {audit.snapshot && (
          <CatalogAuditDetails snapshot={audit.snapshot} saved={audit.saved} />
        )}
        {audit.saved && audit.snapshot && audit.writable && (
          <div className="space-y-2">
            <label htmlFor="audit-note" className="block text-sm font-medium">
              Add a review note
            </label>
            <p className="text-xs text-muted-foreground">
              Your note retains the original evidence references. It does not
              change the evidence or establish rights.
            </p>
            <textarea
              id="audit-note"
              rows={4}
              maxLength={16000}
              value={audit.note}
              disabled={audit.busy || audit.uncertain}
              onChange={(event) => audit.setNote(event.target.value)}
              className="w-full rounded-xl bg-background p-3 text-sm shadow-[0_0_0_1px_var(--border)] focus-visible:outline-ring"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {(audit.writable || audit.uncertain) && (
            <Button
              disabled={
                audit.busy ||
                (!audit.uncertain && audit.saved && !audit.note.trim())
              }
              onClick={() => void audit.save()}
            >
              {audit.uncertain
                ? "Retry exact save"
                : audit.saved
                  ? "Save review note"
                  : "Save audit"}
            </Button>
          )}
          {audit.recoveryId && (
            <Button
              variant="outline"
              disabled={audit.busy}
              onClick={() => void audit.open(audit.recoveryId!)}
            >
              Reopen saved audit
            </Button>
          )}
        </div>
        {audit.busy && (
          <p role="status" className="text-sm text-muted-foreground">
            Loading audit…
          </p>
        )}
        {audit.notice && (
          <p role="status" className="text-sm">
            {audit.notice}
          </p>
        )}
      </section>
    </div>
  );
}
