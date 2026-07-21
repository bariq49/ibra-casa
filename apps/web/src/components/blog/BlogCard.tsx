import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  User,
  Calendar,
  Tag,
  MessageSquare,
  ArrowRight,
  Star,
} from "lucide-react";

interface BlogCardProps {
  post: any;
  view?: "grid" | "list";
}

const BlogCard = ({ post, view = "grid" }: BlogCardProps) => {
  if (view === "list") {
    return (
      <div className="flex border border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full overflow-hidden items-center group">
        <div className="w-75 h-full relative min-h-55 shrink-0">
          <Link href={`/blogs/${post.slug}`} className="absolute inset-0">
            <Image
              src={post.image || "/placeholder-blog.jpg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>
        <div className="flex flex-col p-6 flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-muted-foreground text-xs ml-1">(5.0)</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-3">
              <User className="size-4 shrink-0" />
              <span className="truncate">
                {post.author?.name || "Sellzy Author"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 shrink-0" />
              <span className="truncate">{post.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="size-4 shrink-0" />
              <span className="truncate">{post.category || "General"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-auto">
            <Link
              href={`/blogs/${post.slug}`}
              className="flex-1 flex items-center justify-center gap-2 border border-border rounded-full py-2.5 font-medium text-foreground hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <MessageSquare className="size-4" />
              Comment ({post.commentsCount || 0})
            </Link>
            <Link
              href={`/blogs/${post.slug}`}
              className="flex-1 flex items-center justify-center gap-x-2 bg-primary text-white font-medium text-sm py-2.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              Read Article
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-all duration-300 w-full overflow-visible group">
      {/* Top Background Image */}
      <div className="relative w-full h-[350px] rounded-t-2xl overflow-visible shrink-0 pb-0 mb-0">
        <Link
          href={`/blogs/${post.slug}`}
          className="absolute inset-0 rounded-t-2xl overflow-hidden block"
        >
          <Image
            src={post.image || "/placeholder-blog.jpg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {/* Overlapping Avatar matching Figma Node 24164:310857 */}
        <div className="absolute left-6 -bottom-6 size-12 rounded-full border-[3px] border-white bg-gray-100 overflow-hidden z-10 shadow-sm flex items-center justify-center">
          {post.author?.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author?.name || "Author"}
              fill
              className="object-cover"
            />
          ) : (
            <User className="size-6 text-gray-400" />
          )}
        </div>
      </div>

      <div className="flex flex-col px-6 pt-10 pb-6 flex-1 relative z-0">
        <div className="flex justify-between items-start gap-4 mb-5">
          <h3 className="text-[17px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
          </h3>
          <div className="flex items-center gap-[2px] shrink-0 text-[#FFB020]">
            <Star className="w-[14px] h-[14px] fill-current text-[#FFB020]" />
            <Star className="w-[14px] h-[14px] fill-current text-[#FFB020]" />
            <Star className="w-[14px] h-[14px] fill-current text-[#FFB020]" />
            <Star className="w-[14px] h-[14px] fill-current text-[#FFB020]" />
            <Star className="w-[14px] h-[14px] fill-[#DFE3E8] text-[#DFE3E8]" />
            <span className="text-[#637381] text-[12px] font-medium ml-1">
              (189)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-[#637381] mb-7">
          <div className="flex items-center gap-3">
            <User className="size-[18px] shrink-0" strokeWidth={1.5} />
            <span className="truncate">
              {post.author?.name || "Sellzy Author"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="size-[18px] shrink-0" strokeWidth={1.5} />
            <span className="truncate">{post.date}</span>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="size-[18px] shrink-0" strokeWidth={1.5} />
            <span className="truncate">
              {post.category || "General Insights"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
          <Link
            href={`/blogs/${post.slug}`}
            className="flex items-center justify-center gap-2 border border-[#919EAB]/30 rounded-[8px] py-[10px] font-semibold text-[#212B36] hover:border-primary hover:text-primary transition-colors text-[14px]"
          >
            <MessageSquare className="size-4" strokeWidth={2} />
            Comments
          </Link>
          <Link
            href={`/blogs/${post.slug}`}
            className="flex items-center justify-center gap-2 bg-primary text-white font-semibold text-[14px] py-[10px] rounded-[8px] hover:bg-primary/90 transition-colors shadow-[0_8px_16px_rgba(0,167,111,0.24)]"
          >
            <ArrowRight className="size-4" strokeWidth={2} />
            Read Full
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
