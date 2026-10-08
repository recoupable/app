"use client";
import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useProfessionalRoster } from "@/hooks/useProfessionalRoster";
import { requestProfessionalRoster } from "@/lib/professionals/requestProfessionalRoster";
import type { ProfessionalRequest } from "@/lib/professionals/schema";
import { usePendingProfessionalRequest } from "@/hooks/usePendingProfessionalRequest";
import { ProfessionalRequestError } from "@/lib/professionals/ProfessionalRequestError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ManualProfessionalForm({
  organizationId,
  organizationName,
  actorId,
  onSaved,
}: {
  organizationId: string;
  organizationName: string;
  actorId: string;
  onSaved: () => void;
}) {
  const roster = useProfessionalRoster(organizationId);
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const { storageKey, pending, setPending, restored } =
    usePendingProfessionalRequest(actorId, organizationId);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [name, setName] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [roles, setRoles] = useState<Array<"songwriter" | "producer">>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [error, setError] = useState("");
  const people = roster.data?.pages.flatMap((page) => page.professionals) ?? [];
  const namesakes = people.filter(
    (person) =>
      person.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
  );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !restored ||
      lock.current ||
      (!pending &&
        (!confirmed ||
          roster.isPending ||
          roster.isError ||
          (mode === "new" && roster.hasNextPage)))
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const body: ProfessionalRequest = pending ?? {
        organization_id: organizationId,
        idempotency_key: crypto.randomUUID(),
        mode,
        ...(mode === "new"
          ? { name: name.trim() }
          : { professional_id: professionalId }),
        roles,
        confirmed: true,
        roster_intent: "add",
      };
      // Persist before sending: a lost response or refresh must reuse the same operation.
      sessionStorage.setItem(storageKey, JSON.stringify(body));
      setPending(body);
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in again, then retry this request.");
      const result = await requestProfessionalRoster(
        token,
        organizationId,
        body,
      );
      if (!("professional" in result))
        throw new Error(
          "Could not confirm the saved record. Retry this request.",
        );
      sessionStorage.removeItem(storageKey);
      setPending(null);
      await queryClient.invalidateQueries({
        queryKey: ["professional-roster", actorId, organizationId],
      });
      if (mounted.current) onSaved();
    } catch (error) {
      if (
        error instanceof ProfessionalRequestError &&
        [400, 403, 409].includes(error.status)
      ) {
        sessionStorage.removeItem(storageKey);
        setPending(null);
      }
      setError(
        error instanceof Error
          ? error.message
          : "Could not save. Please retry.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm">
        Add to <strong>{organizationName}</strong>’s roster. This records
        professional roles, not catalog rights.
      </p>
      {pending ? (
        <p role="status">
          A request for{" "}
          {pending.name ??
            people.find((person) => person.id === pending.professional_id)
              ?.name ??
            "the selected professional"}{" "}
          is awaiting confirmation. Retry it safely using the same request.
        </p>
      ) : (
        <fieldset disabled={busy} className="space-y-3">
          <label className="flex gap-2">
            <input
              type="radio"
              name="professional-mode"
              checked={mode === "new"}
              onChange={() => {
                setMode("new");
                setConfirmed(false);
              }}
            />
            Add a new person
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              name="professional-mode"
              checked={mode === "existing"}
              onChange={() => {
                setMode("existing");
                setConfirmed(false);
              }}
            />
            Use an existing professional record
          </label>
          {mode === "new" ? (
            <label className="block space-y-1">
              Professional name
              <Input
                value={name}
                minLength={2}
                maxLength={200}
                required
                onChange={(e) => {
                  setName(e.target.value);
                  setConfirmed(false);
                }}
              />
            </label>
          ) : (
            <label className="block space-y-1">
              Existing professional
              <select
                className="w-full rounded-md bg-background p-2 shadow-[0_0_0_1px_var(--border)]"
                required
                value={professionalId}
                onChange={(e) => {
                  setProfessionalId(e.target.value);
                  setConfirmed(false);
                }}
              >
                <option value="">Choose a record</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} · {person.roles.join(", ")} ·{" "}
                    {person.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {namesakes.length > 0 && mode === "new" && (
            <p role="status">
              This roster already has {namesakes.length} record(s) with this
              name. Select the existing record if it is the same person; only
              create a new record for a different person.
            </p>
          )}
          {roster.hasNextPage && mode === "new" && (
            <p className="text-sm">
              Load all existing records before confirming a distinct new person.
            </p>
          )}
          {roster.hasNextPage && (
            <Button
              type="button"
              variant="outline"
              disabled={roster.isFetchingNextPage}
              onClick={() => {
                setConfirmed(false);
                void roster.fetchNextPage();
              }}
            >
              Load more existing records
            </Button>
          )}
          <fieldset className="space-y-2">
            <legend>Professional roles</legend>
            {(["songwriter", "producer"] as const).map((role) => (
              <label key={role} className="flex gap-2 capitalize">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={(e) => {
                    setRoles(
                      e.target.checked
                        ? [...roles, role]
                        : roles.filter((item) => item !== role),
                    );
                    setConfirmed(false);
                  }}
                />
                {role}
              </label>
            ))}
          </fieldset>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={
                mode === "new" &&
                (roster.isPending ||
                  roster.isError ||
                  Boolean(roster.hasNextPage))
              }
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            {mode === "new"
              ? "I confirm this is a new person, distinct from any existing records, and want to add them to this organization’s roster."
              : "I confirm the selected record is the intended person and want to add these roles to this organization’s roster."}
          </label>
        </fieldset>
      )}
      {roster.isError && (
        <p role="alert">
          Could not load existing records.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => roster.refetch()}
          >
            Retry roster
          </button>
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <Button
        type="submit"
        className="min-h-11"
        disabled={
          !restored ||
          busy ||
          (!pending &&
            (roster.isPending ||
              roster.isError ||
              (mode === "new" && roster.hasNextPage) ||
              !confirmed ||
              !roles.length ||
              (mode === "new" ? name.trim().length < 2 : !professionalId)))
        }
      >
        {busy
          ? "Saving…"
          : pending
            ? "Retry saved request"
            : "Confirm roster addition"}
      </Button>
    </form>
  );
}
