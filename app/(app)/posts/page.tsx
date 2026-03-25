"use client";

import { type NextPage } from "next";
import PostsWrapper from "@/components/Posts/PostsWrapper";

const PostsPage: NextPage = () => {
  return (
    <div className="max-w-screen min-h-screen p-4">
      <h1 className="text-lg md:text-xl font-bold pb-4">Artist Posts</h1>
      <PostsWrapper />
    </div>
  );
};

export default PostsPage;
