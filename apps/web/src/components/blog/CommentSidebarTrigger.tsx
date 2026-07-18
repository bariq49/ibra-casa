"use client";

import { MessageCircle } from "lucide-react";
import { useCommentSidebarStore } from "@/store/useCommentSidebarStore";

export default function CommentSidebarTrigger() {
  const { onOpen } = useCommentSidebarStore();

  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-x-2 text-light-secondary-text font-medium text-[13px] sm:text-sm cursor-pointer hover:text-primary transition-colors"
    >
      <MessageCircle className="size-4" />
      <span>Comments</span>
    </div>
  );
}
