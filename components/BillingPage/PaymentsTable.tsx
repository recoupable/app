import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentsRow from "./PaymentsRow";
import type { AccountPayment } from "@/lib/recoup/getAccountPayments";

const HEAD =
  "h-auto py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

/** Every invoice on the account, newest first; the empty state when there are none. */
const PaymentsTable = ({ payments }: { payments: AccountPayment[] }) => {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center shadow-[0_0_0_1px_var(--border)]">
        <p className="text-sm text-muted-foreground">No payments yet.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${HEAD} pl-0 pr-3`}>When</TableHead>
            <TableHead className={`${HEAD} w-full px-3`}>Description</TableHead>
            <TableHead className={`${HEAD} hidden px-3 md:table-cell`}>Status</TableHead>
            <TableHead className={`${HEAD} pl-3 text-right`}>Amount</TableHead>
            <TableHead className={`${HEAD} hidden pl-3 pr-0 md:table-cell`}>
              <span className="sr-only">Receipt</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <PaymentsRow key={payment.id} payment={payment} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentsTable;
