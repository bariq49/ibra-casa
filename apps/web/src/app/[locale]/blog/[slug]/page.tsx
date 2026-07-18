import React from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import Image from "next/image";
import {
  Calendar,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import BlogComments from "@/components/blog/BlogComments";
import RelatedArticles from "@/components/blog/RelatedArticles";
import CommentSidebarTrigger from "@/components/blog/CommentSidebarTrigger";
import CommentSidebar from "@/components/blog/CommentSidebar";
import type { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: "Blog Details"
  };
}


type RealBlog = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  bannerImage?: string;
  content: string;
  excerpt?: string;
  category: { _id: string; name: string };
  author: { _id: string; name: string; image?: string };
  tags?: string[];
  views?: number;
  publishedAt: string;
  createdAt: string;
};

const SingleBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  let post: RealBlog | null = null;
  let relatedPosts: RealBlog[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/blogs/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      post = await res.json();

      // Fetch related blogs from the same category
      if (post?.category?._id) {
        const relatedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/blogs?category=${post.category._id}&limit=4`,
          { next: { revalidate: 60 } },
        );
        if (relatedRes.ok) {
          const data = await relatedRes.json();
          // Filter out the current post
          relatedPosts =
            data.blogs?.filter((b: RealBlog) => b._id !== post?._id) || [];
        }
      }
    }
  } catch (error) {
    console.error("Error fetching blog", error);
  }

  if (!post) {
    return (
      <main className="bg-white min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-light-primary-text">
            Blog Post Not Found
          </h1>
          <p className="text-light-secondary-text">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumb />

      <section className="pb-[70px]">
        <Container>
          {/* Main Article Content */}
          <div className="w-full min-w-0">
            <div className="relative w-full aspect-21/12 rounded-2xl overflow-hidden group">
              <Image
                src={
                  post.bannerImage ||
                  post.previewImage ||
                  "/images/placeholder.png"
                }
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Header Info Banner overlapping Hero */}
            <div className="relative -mt-16 sm:-mt-24 z-10 mx-4 sm:mx-12 bg-warning-light rounded-[24px] p-6 sm:p-10 text-center shadow-lg">
              <div className="mb-4">
                <span className="text-primary-light font-bold text-sm tracking-wide">
                  {post.category?.name || "Uncategorized"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-[32px] leading-tight font-bold text-light-primary-text mb-6 max-w-2xl mx-auto">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-x-2 text-light-secondary-text font-medium text-[13px] sm:text-sm">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(
                      post.publishedAt || post.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <CommentSidebarTrigger />
                <div className="flex items-center gap-x-2 text-light-secondary-text font-medium text-[13px] sm:text-sm">
                  <Eye className="size-4" />
                  <span>{post.views || 0} views</span>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Rich Text Content */}
              <div className="max-w-full w-full break-words overflow-hidden text-light-secondary-text mt-12 bg-white font-public-sans leading-relaxed text-base [&_p]:mb-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-light-primary-text [&_h1]:mt-10 [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-light-primary-text [&_h2]:mt-10 [&_h2]:mb-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-light-primary-text [&_h3]:mt-8 [&_h3]:mb-4 [&_img]:rounded-2xl [&_img]:w-full [&_img]:object-cover [&_img]:my-10 [&_blockquote]:bg-warning-light [&_blockquote]:rounded-[24px] [&_blockquote]:p-8 [&_blockquote]:md:p-10 [&_blockquote]:my-10 [&_blockquote]:text-center [&_blockquote]:text-xl [&_blockquote]:md:text-2xl [&_blockquote]:font-semibold [&_blockquote]:text-light-primary-text [&_blockquote]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_a]:text-primary-light [&_a]:hover:underline [&_pre]:bg-light-bg [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:bg-light-bg [&_code]:px-1 [&_code]:rounded">
                {/* Dynamically inserted content from the backend payload */}
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Tags & Social Share */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b border-light-border mt-10">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="font-bold text-light-primary-text text-sm">
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-light-bg text-xs font-semibold rounded-full text-light-primary-text hover:bg-primary-light hover:text-white transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-light-secondary-text text-sm">
                        No tags
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                  <span className="font-bold text-light-primary-text text-sm">
                    Share:
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { name: "facebook", Icon: Facebook },
                      { name: "twitter", Icon: Twitter },
                      { name: "instagram", Icon: Instagram },
                      { name: "linkedin", Icon: Linkedin },
                    ].map(({ name, Icon }) => (
                      <button
                        key={name}
                        className="size-8 rounded-full border border-light-border flex items-center justify-center hover:bg-primary-light hover:text-white transition-colors text-light-secondary-text"
                        aria-label={`Share on ${name}`}
                      >
                        <Icon className="size-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <BlogComments blogId={post._id} />
            </div>
          </div>

          <div className="mt-16">
            <RelatedArticles relatedPosts={relatedPosts} />
          </div>

          <CommentSidebar blogId={post._id} />
        </Container>
      </section>
    </main>
  );
};

export default SingleBlogPage;
