import React from "react";
import ToolError from "../shared/ToolError";

interface YouTubeRevenueErrorProps {
  message?: string;
}

export default function YouTubeRevenueError({
  message,
}: YouTubeRevenueErrorProps) {
  return <ToolError title="YouTube revenue" message={message} />;
}
