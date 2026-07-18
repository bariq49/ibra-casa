"use client";

import React from "react";
import BlogCard from "./BlogCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type BlogSummary = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  excerpt?: string;
  category: { _id: string; name: string };
  author: { _id: string; name: string };
  publishedAt: string;
  createdAt: string;
  views?: number;
};

const RelatedArticles = ({
  relatedPosts,
}: {
  relatedPosts: BlogSummary[];
}) => {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-foreground relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-6 before:bg-primary before:rounded-full">
          Related Articles
        </h3>
        <div className="flex items-center gap-2">
          <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50 group">
            <ChevronLeft className="size-5 text-muted-foreground group-hover:text-white" />
          </button>
          <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors group">
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard
            key={`related-${post._id}`}
            post={{
              id: post._id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt || "",
              image: post.previewImage,
              category: post.category?.name || "Uncategorized",
              date: new Date(post.publishedAt || post.createdAt).toLocaleDateString(),
              commentsCount: 0,
              content: "",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
