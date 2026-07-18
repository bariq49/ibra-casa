import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Calendar, MessageCircle } from "lucide-react";
import BlogSearch from "./BlogSearch";

export type SidebarCategory = {
  _id: string;
  name: string;
  slug: string;
  count?: number;
};

export type SidebarTag = {
  _id: string;
  name: string;
  slug: string;
};

export type RecentPost = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  publishedAt: string;
  createdAt: string;
  views?: number;
};

interface BlogSidebarProps {
  categories: SidebarCategory[];
  tags: SidebarTag[];
  recentPosts: RecentPost[];
}

const BlogSidebar = ({
  categories = [],
  tags = [],
  recentPosts = [],
}: BlogSidebarProps) => {
  return (
    <div className="space-y-8">
      {/* Search Section */}
      <BlogSearch />

      {/* Category Section */}
      <div className="bg-white border border-light-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-b-light-border pb-4">
          <h4 className="text-xl font-bold text-foreground">Category</h4>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
            Reset
          </button>
        </div>
        <ul className="space-y-3">
          {categories.slice(0, 10).map((category) => (
            <li key={category._id}>
              <Link
                href={`/blog?category=${category._id}`}
                className="w-full flex items-center justify-between text-light-secondary-text hover:text-primary transition-colors group"
              >
                <div className="flex items-center gap-x-3">
                  <div className="size-4 shrink-0 rounded-[4px] border border-light-border group-hover:border-primary transition-colors flex items-center justify-center"></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                {category.count !== undefined && (
                  <span>( {category.count} )</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Tags Section */}
      <div className="bg-muted rounded-2xl p-6 border border-border/40">
        <h4 className="text-xl font-bold text-foreground mb-6">Popular tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) => (
            <Link
              key={tag._id}
              href={`/blog?tag=${tag.slug || tag.name.toLowerCase()}`}
              className="px-4 py-2 bg-white border border-light-border rounded-full text-sm font-medium text-light-secondary-text hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="bg-muted rounded-2xl p-6 border border-border/40">
        <h4 className="text-xl font-bold text-foreground mb-6">Recent Posts</h4>
        <div className="space-y-6">
          {recentPosts.map((post) => (
            <div key={`recent-${post._id}`} className="flex gap-4 group">
              <Link
                href={`/blog/${post.slug}`}
                className="shrink-0 relative size-[85px] rounded-xl overflow-hidden"
              >
                <Image
                  src={post.previewImage || "/placeholder-blog.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </Link>
              <div className="flex flex-col justify-center flex-1 py-1 min-w-0">
                <h5 className="font-bold text-light-primary-text text-sm line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h5>
                <div className="flex flex-col gap-1.5 text-xs text-light-secondary-text">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />{" "}
                    {new Date(
                      post.publishedAt || post.createdAt,
                    ).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3" /> (0)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;
