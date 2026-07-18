"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

const BlogComments = ({ blogId }: { blogId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { onAuthOpen } = useHeaderStore();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/api/comments/blog/${blogId}`);
        setComments(data);
      } catch (error) {
        console.error("Failed to load comments", error);
      }
    };
    if (blogId) fetchComments();
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to post a comment");
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/api/comments", {
        blogId,
        content,
      });
      setComments([data, ...comments]);
      setContent("");
      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Failed to post comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="mt-16 bg-white w-full">
      {/* Comments List */}
      <div className="mb-8 flex items-center gap-2">
        <h3 className="text-2xl font-bold text-light-primary-text">
          Comments
        </h3>
        <span className="text-light-secondary-text font-medium text-lg">({comments.length})</span>
      </div>

      <div className="flex flex-col h-full">
          {/* Comments List */}
          <div className="space-y-6 mb-8 flex-1">
            {comments.length === 0 ? (
              <p className="text-light-secondary-text text-sm italic">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <div className="size-10 rounded-full overflow-hidden shrink-0 bg-light-bg">
                    <Image
                      src={
                        comment.user.avatar ||
                        "https://res.cloudinary.com/dcs9nphcp/image/upload/v1759859570/defaultUserImage_dzrcwx.png"
                      }
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-light-bg p-4 rounded-xl relative hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h5 className="font-bold text-light-primary-text text-sm">
                          {comment.user.name}
                        </h5>
                        <p className="text-[11px] text-light-secondary-text mt-0.5">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-light-secondary-text leading-relaxed mt-2 line-clamp-4 hover:line-clamp-none transition-all">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Leave a Reply Form */}
          <div className="pt-8 border-t border-light-divider mt-auto">
            {isAuthenticated ? (
              <div className="bg-white rounded-2xl p-6 md:p-10 border border-light-border shadow-sm">
                <h3 className="text-[22px] font-bold text-light-primary-text mb-2">
                  Leave a Reply
                </h3>
                <p className="text-sm text-light-secondary-text mb-8">
                  Your email address will not be published. Required fields are marked *
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-light-primary-text">
                      Comment *
                    </label>
                    <textarea
                      placeholder="Write your comment here..."
                      className="w-full h-[140px] bg-white border border-light-border rounded-xl p-5 outline-none focus:border-primary transition-colors resize-none text-light-primary-text"
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-light-primary-text">
                        Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full h-[52px] bg-white border border-light-border rounded-xl px-5 outline-none focus:border-primary transition-colors text-light-primary-text"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-light-primary-text">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        className="w-full h-[52px] bg-light-bg border border-light-border rounded-xl px-5 outline-none focus:border-primary transition-colors text-light-secondary-text cursor-not-allowed"
                        disabled
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="h-[52px] px-10 rounded-full font-bold text-base bg-primary hover:bg-primary/90 text-white transition-colors"
                      disabled={submitting}
                    >
                      {submitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 md:p-10 border border-light-border shadow-sm">
                <h3 className="text-[22px] font-bold text-light-primary-text mb-2">
                  Leave a Reply
                </h3>
                <p className="text-sm text-light-secondary-text mb-8">
                  Your email address will not be published. Required fields are marked *
                </p>

                <div className="space-y-6 opacity-60 pointer-events-none grayscale">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-light-primary-text">Comment *</label>
                    <div className="w-full h-[140px] bg-light-bg border border-light-border rounded-xl" />
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-light-primary-text">Name *</label>
                      <div className="w-full h-[52px] bg-light-bg border border-light-border rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-light-primary-text">Email *</label>
                      <div className="w-full h-[52px] bg-light-bg border border-light-border rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      onAuthOpen("login");
                    }}
                    className="h-[52px] px-10 rounded-full font-bold text-base bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Sign In to Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default BlogComments;
