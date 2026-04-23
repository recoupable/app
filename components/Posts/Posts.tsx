import { type Post } from "@/types/Post";
import PostCard from "./PostCard";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import LoadMorePosts from "./LoadMorePosts";

interface PostsProps {
  posts: Post[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

const Posts = ({
  posts,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: PostsProps) => {
  // Track if we've already triggered the load more action
  const loadingRef = useRef(false);

  // Set up the intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    // Only start observing if we have more pages and aren't already fetching
    skip: !hasNextPage || isFetchingNextPage,
  });

  // Fetch more posts when the load more element comes into view
  useEffect(() => {
    // Only proceed if:
    // 1. The element is in view
    // 2. We have more pages to load
    // 3. We're not already fetching
    // 4. We haven't already triggered this load
    if (inView && hasNextPage && !isFetchingNextPage && !loadingRef.current) {
      loadingRef.current = true;
      fetchNextPage();
    }

    // Reset the loading ref when fetching completes
    if (!isFetchingNextPage) {
      loadingRef.current = false;
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <LoadMorePosts
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadMoreRef={loadMoreRef}
      />
    </div>
  );
};

export default Posts;
