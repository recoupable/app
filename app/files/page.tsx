import SandboxFileTree from "@/components/Sandboxes/SandboxFileTree";

export default async function FilesPage() {
  return (
    <div className="px-6 md:px-12 py-8 space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-left font-heading text-3xl font-bold">
          Files
        </h1>
        <p className="mt-2 text-lg text-muted-foreground font-light font-sans">
          Upload repository files for your agent sandbox, including code, docs, assets, and reference material.
        </p>
      </div>
      <SandboxFileTree />
    </div>
  );
}
