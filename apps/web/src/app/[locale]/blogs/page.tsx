import React from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import api, { API_ENDPOINTS } from "@/lib/api";
import BlogsClient from "@/components/blog/BlogsClient";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Blogs",
};


export default async function BlogPage() {
  let blogs = [];
  try {
    const { data } = await api.get(API_ENDPOINTS.BLOGS.BASE, {
      next: { revalidate: 600 },
    });
    blogs = data.blogs || [];
  } catch (error) {
    console.error("Failed to fetch blogs on server:", error);
  }

  return (
    <main className="bg-white">
      <Breadcrumb />

      <section className="pb-[70px] bg-gray-50/30 min-h-screen">
        <Container>
          <BlogsClient initialBlogs={blogs} />
        </Container>
      </section>
    </main>
  );
}
