"use client";

import React, { useState } from "react";
import { Grid3x3, List } from "lucide-react";
import { cn } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";

type Category = { _id: string; name: string };
type BlogAuthor = { _id: string; name: string; image: string };

type RealBlog = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  category: Category;
  author: BlogAuthor;
  publishedAt: string;
  createdAt: string;
  excerpt?: string;
};

interface BlogsClientProps {
  initialBlogs: RealBlog[];
}

const BlogsClient = ({ initialBlogs }: BlogsClientProps) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [blogs, setBlogs] = useState<RealBlog[]>(initialBlogs);

  return (
    <div className="pt-8">
      {/* Header / Toolbar matching Figma 24164:310857 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2 bg-gray-100/50 p-1 rounded-full border border-border/40">
            <button
              onClick={() => setView("list")}
              className={cn(
                "size-[34px] rounded-full flex items-center justify-center transition-all",
                view === "list"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "size-[34px] rounded-full flex items-center justify-center transition-all",
                view === "grid"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3x3 className="size-4" />
            </button>
          </div>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
            Showing 1–{Math.min(blogs.length, 12)} of {blogs.length} results
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[260px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg
                className="size-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Blog"
              className="w-full h-11 pl-10 pr-4 rounded-full border border-border bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
          <select
            className="border border-border rounded-full px-5 h-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white text-sm font-medium text-foreground cursor-pointer transition-all hover:bg-gray-50 min-w-[110px] appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1rem",
            }}
          >
            <option>Short</option>
            <option>Latest</option>
            <option>Popular</option>
          </select>
        </div>
      </div>

      {blogs.length > 0 ? (
        <div
          className={cn(
            "grid gap-[30px] mb-14",
            view === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 lg:grid-cols-2",
          )}
        >
          {blogs.map((post) => (
            <BlogCard
              key={post._id}
              view={view}
              post={{
                id: post._id,
                title: post.title,
                slug: post.slug,
                category: post.category?.name || "Uncategorized",
                date: new Date(post.publishedAt || post.createdAt).toLocaleDateString(),
                commentsCount: 0,
                excerpt: post.excerpt || "...",
                content: "",
                image: post.previewImage,
                author: {
                  name: post.author?.name || "Anonymous",
                  avatar: post.author?.image || "",
                },
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center p-20 bg-white rounded-2xl border border-border shadow-sm">
          <span className="text-muted-foreground font-medium text-lg">
            No blogs found.
          </span>
        </div>
      )}

      {/* Pagination */}
      {blogs.length > 0 && (
        <div className="flex items-center justify-center gap-x-2">
          <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50 text-muted-foreground bg-white shadow-sm">
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-x-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={cn(
                  "size-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border outline-none bg-white",
                  page === 1
                    ? "border-primary text-primary shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-gray-50 focus:bg-gray-50",
                )}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-muted-foreground flex items-center justify-center size-10">
              ...
            </span>
          </div>
          <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50 text-muted-foreground bg-white shadow-sm">
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogsClient;
