import React, { Suspense } from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import api, { API_ENDPOINTS } from "@/lib/api";
import BlogsClient from "@/components/blog/BlogsClient";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs",
};

async function BlogsContent() {
  let blogs = [];
  try {
    const { data } = await api.get(API_ENDPOINTS.BLOGS.BASE, {
      next: { revalidate: 600 },
    });
    blogs = data.blogs || [];
  } catch (error) {
    console.error("Failed to fetch blogs on server:", error);
  }

  return <BlogsClient initialBlogs={blogs} />;
}

export default function BlogPage() {
  return (
    <main className="bg-white">
      <Breadcrumb />

      <section className="pb-[70px] bg-gray-50/30 min-h-screen">
        <Container>
          <Suspense fallback={<BlogSkeleton />}>
            <BlogsContent />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
