import { vi } from "vitest";
const state = vi.hoisted(() => ({
  auth: {
    authenticated: true,
    user: { id: "actor-a", wallet: undefined, email: undefined },
    ready: false,
    getAccessToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  origin: "https://api.example",
  org: "org-a" as string | null,
  override: {
    email: null as string | null,
    accountIdOverride: null as string | null,
  },
  artist: {
    selectedArtist: { account_id: "artist-a" },
    editableArtist: { account_id: "artist-a" },
    bases: [
      {
        name: "notes.txt",
        url: "https://old.example/notes.txt",
        type: "text/plain",
      },
    ],
    setBases: vi.fn(),
    saveSetting: vi.fn(),
  },
  error: vi.fn(),
  success: vi.fn(),
  chat: {} as Record<string, unknown>,
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => state.auth }));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => state.origin,
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: state.org }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => state.artist,
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => state.override,
}));
vi.mock("@/providers/VercelChatProvider", () => ({
  useVercelChatContext: () => state.chat,
}));
vi.mock("sonner", () => ({ toast: { error: state.error } }));
vi.mock("react-toastify", () => ({
  toast: { error: state.error, success: state.success },
}));
vi.mock("wagmi", () => ({ useAccount: () => ({}) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("../useAccountOrganizations", () => ({
  default: () => ({ data: [] }),
}));

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
export function imageFile(name = "cover.png") {
  return new File(["image"], name, { type: "image/png" });
}
export function inputEvent(...files: File[]) {
  return {
    target: { files },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}
export function receipt(file = imageFile(), key = "uploaded") {
  return Response.json({
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    url: `https://project.supabase.co/storage/v1/object/public/public-uploads/actor/${key}`,
  });
}
export function resetState() {
  state.auth.authenticated = true;
  state.auth.user = { id: "actor-a", wallet: undefined, email: undefined };
  state.auth.ready = false;
  state.auth.getAccessToken.mockResolvedValue("token-a");
  state.origin = "https://api.example";
  state.org = "org-a";
  state.override = { email: null, accountIdOverride: null };
  state.artist.selectedArtist = { account_id: "artist-a" };
  state.artist.editableArtist = { account_id: "artist-a" };
  state.artist.bases = [
    {
      name: "notes.txt",
      url: "https://old.example/notes.txt",
      type: "text/plain",
    },
  ];
  state.artist.saveSetting.mockResolvedValue({ account_id: "artist-a" });
}

export { state };
