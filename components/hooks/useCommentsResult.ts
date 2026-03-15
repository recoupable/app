import { useState } from "react";
import { Comment } from "@/types/Comment";

export const useCommentsResult = (comments: Comment[]) => {
  // State for dialog
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle comment click
  const handleCommentClick = (comment: Comment) => {
    const index = comments.findIndex(c => c.id === comment.id);
    setCurrentIndex(index !== -1 ? index : 0);
    setSelectedComment(comment);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle navigation
  const handleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedComment(comments[newIndex]);
    } else if (direction === "next" && currentIndex < comments.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedComment(comments[newIndex]);
    }
  };

  return {
    selectedComment,
    dialogOpen,
    currentIndex,
    totalComments: comments.length,
    handleCommentClick,
    handleCloseDialog,
    handleNavigation,
  };
};
