import FilesPageHeader from "@/components/Sandboxes/FilesPageHeader";
import SandboxFileTree from "@/components/Sandboxes/SandboxFileTree";

export default async function FilesPage() {
  return (
    <div className="px-6 md:px-12 py-8 space-y-6">
      <FilesPageHeader />
      <SandboxFileTree />
    </div>
  );
}
