import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import formatCents from "@/lib/billing/formatCents";
import formatBillingDate from "@/lib/billing/formatBillingDate";
import type { AccountPayment } from "@/lib/recoup/getAccountPayments";

const statusLabel: Record<AccountPayment["status"], string> = {
  paid: "Paid",
  open: "Open",
  draft: "Draft",
  uncollectible: "Uncollectible",
  void: "Void",
};

/** One invoice. Status sits under the description on a phone, in its own column from md up. */
const PaymentsRow = ({ payment }: { payment: AccountPayment }) => {
  const badge = payment.status === "paid" ? (
    <Badge className="border-transparent bg-[rgba(34,197,94,0.10)] text-[#16a34a] shadow-none hover:bg-[rgba(34,197,94,0.10)] dark:text-[#4ade80]">
      Paid
    </Badge>
  ) : (
    <Badge variant="secondary">{statusLabel[payment.status]}</Badge>
  );
  return (
    <TableRow className="text-sm hover:bg-transparent">
      <TableCell className="whitespace-nowrap py-2.5 pl-0 pr-3 text-muted-foreground">
        {formatBillingDate(payment.createdAt)}
      </TableCell>
      <TableCell className="w-full py-2.5 px-3">
        <div className="flex flex-col gap-1">
          <span>{payment.description}</span>
          <span className="md:hidden">{badge}</span>
        </div>
      </TableCell>
      <TableCell className="hidden whitespace-nowrap py-2.5 px-3 md:table-cell">{badge}</TableCell>
      <TableCell className="whitespace-nowrap py-2.5 pl-3 text-right font-medium">
        {formatCents(payment.amountCents, payment.currency)}
      </TableCell>
      <TableCell className="hidden py-2.5 pl-3 pr-0 text-right md:table-cell">
        {payment.url && (
          <a
            href={payment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Receipt <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PaymentsRow;
