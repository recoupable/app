import Link from "next/link";
import { KeyRound } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const ApiKeysMenuItem = () => {
  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href="/keys">
        <KeyRound className="h-4 w-4" />
        API Keys
      </Link>
    </DropdownMenuItem>
  );
};

export default ApiKeysMenuItem;
