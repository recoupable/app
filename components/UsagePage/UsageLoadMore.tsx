import { Button } from "@/components/ui/button";

interface UsageLoadMoreProps {
  onClick: () => void;
  isLoading: boolean;
}

const UsageLoadMore = ({ onClick, isLoading }: UsageLoadMoreProps) => (
  <div className="mt-4 flex justify-center">
    <Button variant="outline" onClick={onClick} disabled={isLoading}>
      {isLoading ? "Loading" : "Load more"}
    </Button>
  </div>
);

export default UsageLoadMore;
