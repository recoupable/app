import Link from "next/link";
import { getAccountScopedHref } from "@/lib/tasks/getAccountScopedHref";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface RunBreadcrumbProps {
  runId: string;
  accountId?: string;
}

export default function RunBreadcrumb({
  runId,
  accountId,
}: RunBreadcrumbProps) {
  return (
    <Breadcrumb className="px-6 pt-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={getAccountScopedHref("/tasks?tab=recents", accountId)}>
              Tasks
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{runId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
