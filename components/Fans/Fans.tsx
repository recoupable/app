import { type Social } from "@/types/Social";
import FanAvatar from "./FanAvatar";
import FansList from "./FansList";

interface FansProps {
  fansWithAvatars: Social[];
  fansWithoutAvatars: Social[];
  isFetchingNextPage: boolean;
}

const Fans = ({
  fansWithAvatars,
  fansWithoutAvatars,
  isFetchingNextPage,
}: FansProps) => {
  return (
    <div className="space-y-8">
      {fansWithAvatars.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Fans with Profile Pictures</h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-4">
            {fansWithAvatars.map((fan) => (
              <FanAvatar key={fan.id} fan={fan} />
            ))}
          </div>
        </div>
      )}

      {fansWithoutAvatars.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">
            Fans without Profile Pictures
          </h2>
          <FansList fans={fansWithoutAvatars} />
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-muted-foreground">
            Loading more fans...
          </div>
        </div>
      )}
    </div>
  );
};

export default Fans;
