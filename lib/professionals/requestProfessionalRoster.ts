import { ProfessionalRequestError } from "./ProfessionalRequestError";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import {
  professionalListSchema,
  professionalResultSchema,
  type ProfessionalRequest,
} from "./schema";

/** Keeps error responses and unvalidated provider data out of the roster UI. */
export async function requestProfessionalRoster(
  token: string,
  organizationId: string,
  body?: ProfessionalRequest,
  after?: string,
) {
  const params = new URLSearchParams({ organization_id: organizationId });
  if (after) params.set("after", after);
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/organizations/professionals${body ? "" : `?${params}`}`,
    {
      method: body ? "POST" : "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new ProfessionalRequestError(
      response.status === 403
        ? "You no longer have access to this organization."
        : body && [400, 409].includes(response.status)
          ? "Review and correct the name, selected record, and roles before submitting again."
          : "Could not load or save the roster. Please retry.",
      response.status,
    );
  const parsed = body
    ? professionalResultSchema.safeParse(data)
    : professionalListSchema.safeParse(data);
  if (!parsed.success)
    throw new Error(
      "Could not confirm the response. Please retry this request.",
    );
  const people =
    "professional" in parsed.data
      ? [parsed.data.professional]
      : parsed.data.professionals;
  if (people.some((person) => person.organization_id !== organizationId))
    throw new Error(
      "The response does not match this organization. Please retry.",
    );
  return parsed.data;
}
