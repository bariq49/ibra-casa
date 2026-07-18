"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, Calendar, MessageSquare } from "lucide-react";
import Container from "../common/Container";
import { Blog } from "./LatestBlogs";
import { chatIcon } from "@/images";

export default function LatestBlogsClient({ blogs }: { blogs: Blog[] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Urbanist',sans-serif] text-[32px] font-bold text-light-primary-text leading-[48px]">
              Latest Blogs
            </h2>
            <Link
              href="/blogs"
              className="font-['Urbanist',sans-serif] text-[24px] font-bold text-light-primary-text leading-[36px] hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white border border-light-divider rounded-[16px] overflow-hidden flex flex-col group hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <Link
                  href={`/blog/${blog.slug}`}
                  className="px-6 pt-6 block cursor-pointer"
                >
                  <div className="relative h-[250px] w-full rounded-[16px] overflow-hidden">
                    <Image
                      src={blog.previewImage || "/placeholder-blog.jpg"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col items-start grow gap-4">
                  {/* Category Pill */}
                  <div className="bg-warning/16 px-2 py-px rounded-[100px] w-max">
                    <span className="font-['DM_Sans',sans-serif] text-[12px] text-warning-dark leading-[18px]">
                      {blog.category?.name || "Uncategorized"}
                    </span>
                  </div>

                  {/* Meta Data */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-light-secondary-text shrink-0" />
                      <span className="font-['DM_Sans',sans-serif] text-[14px] text-light-secondary-text leading-[22px] truncate">
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : new Date(blog.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                      </span>
                    </div>

                    <div className="h-4 w-px bg-light-disabled-text/24 shrink-0" />

                    <div className="flex items-center gap-1">
                      <Image src={chatIcon} className="w-5" alt="chatIcon" />
                      <span className="font-['DM_Sans',sans-serif] text-[14px] text-light-secondary-text leading-[22px]">
                        Comment
                      </span>
                      <span className="font-['DM_Sans',sans-serif] text-[14px] text-light-secondary-text leading-[22px]">
                        ({blog.commentsCount || 0})
                      </span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-3 w-full">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <h4 className="text-[18px] font-bold text-light-primary-text hover:text-primary transition-colors leading-[28px] line-clamp-2">
                        {blog.title}
                      </h4>
                    </Link>
                    <p className="text-base text-light-secondary-text leading-[24px] line-clamp-2 font-normal">
                      {blog.excerpt ||
                        "Read more about this topic in our blog..."}
                    </p>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-auto bg-primary-light hover:bg-primary transition-colors duration-300 inline-flex items-center justify-between px-3 py-2 rounded-[59px] w-[167px] group/btn"
                  >
                    <span className="font-['DM_Sans',sans-serif] font-semibold text-[16px] text-white leading-[26px] pl-3">
                      Read More
                    </span>
                    <div className="bg-white flex items-center justify-center rounded-full size-[32px] shrink-0">
                      <ArrowUpRight className="size-4 text-primary group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
