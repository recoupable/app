import { House, HelpCircle, ExternalLink } from "lucide-react";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DOCS_BASE_URL } from "@/lib/consts";

const ExternalLinksGroup = () => (
  <DropdownMenuGroup>
    <DropdownMenuItem asChild className="cursor-pointer">
      <a href="https://recoupable.dev" target="_blank" rel="noopener noreferrer">
        <House className="h-4 w-4" />
        recoupable.dev
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
      </a>
    </DropdownMenuItem>
    <DropdownMenuItem asChild className="cursor-pointer">
      <a href={DOCS_BASE_URL} target="_blank" rel="noopener noreferrer">
        <HelpCircle className="h-4 w-4" />
        Help & Docs
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
      </a>
    </DropdownMenuItem>
  </DropdownMenuGroup>
);

export default ExternalLinksGroup;
