"use client";

import { useCommentSidebarStore } from "@/store/useCommentSidebarStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import BlogComments from "./BlogComments";

interface CommentSidebarProps {
  blogId: string;
}

export default function CommentSidebar({ blogId }: CommentSidebarProps) {
  const { isOpen, onClose, onOpen } = useCommentSidebarStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-6 sm:p-8">
        <div className="flex flex-col h-full -mt-16">
          <BlogComments blogId={blogId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
