import { createContext } from "react";

export const ArtistFixtureContext = createContext<Record<string, unknown>>({});
export const OrganizationFixtureContext = createContext<
  Record<string, unknown>
>({});
