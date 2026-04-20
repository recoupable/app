import { type Social } from "@/types/ArtistSocials";

interface FansListProps {
  fans: Social[];
}

const FansList = ({ fans }: FansListProps) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fans.map((fan) => (
        <li
          key={fan.id}
          className="p-4 border border-border-light  rounded-lg hover:border-blue-500 dark:hover:border-blue-600 transition-colors duration-300"
        >
          <a
            href={fan.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex flex-col">
              <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate">
                {fan.username || "Anonymous"}
              </div>

              <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                {fan.follower_count.toLocaleString()} followers
              </div>

              {fan.region && (
                <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                  Region: {fan.region}
                </div>
              )}

              {fan.bio && (
                <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 line-clamp-2">
                  {fan.bio}
                </div>
              )}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default FansList;
