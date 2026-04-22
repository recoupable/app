import { useArtistProvider } from "@/providers/ArtistProvider";
import { useArtistPosts } from "@/hooks/useArtistPosts";
import { type Post } from "@/types/Post";
import Posts from "./Posts";
import PostsSkeleton from "./PostsSkeleton";

const POSTS_PER_PAGE = 20; // Match API default

const PostsWrapper = () => {
  const { selectedArtist } = useArtistProvider();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArtistPosts(selectedArtist?.account_id, POSTS_PER_PAGE);

  const allPosts =
    data?.pages?.reduce((acc: Post[], page) => {
      return [...acc, ...page.posts];
    }, []) ?? [];

  const sortedPosts = [...allPosts].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  if (!selectedArtist || isLoading) {
    return <PostsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-lg text-center text-red-500 py-8">
        Failed to load posts: {error.message}
      </div>
    );
  }

  if (!sortedPosts.length) {
    return (
      <div className="text-lg text-center py-8">
        No posts found for this artist.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Posts
        posts={sortedPosts}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default PostsWrapper;
