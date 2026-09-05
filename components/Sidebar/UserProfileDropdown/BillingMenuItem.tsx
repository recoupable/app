import Link from "next/link";
import { CreditCard } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const BillingMenuItem = () => {
  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href="/billing">
        <CreditCard className="h-4 w-4" />
        Billing
      </Link>
    </DropdownMenuItem>
  );
};

export default BillingMenuItem;
