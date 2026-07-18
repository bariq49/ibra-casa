import { setRequestLocale } from "next-intl/server";
import LatestBlogsClient from "./LatestBlogsClient";

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  previewImage: string;
  excerpt?: string;
  author: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
  publishedAt?: string;
  readTime?: number;
  views?: number;
  commentsCount?: number;
};

export default async function LatestBlogs({
  locale,
  /** Pre-fetched blogs passed from the page — avoids double-fetch waterfall */
  blogs: prefetchedBlogs,
}: {
  locale: string;
  productBase?: string;
  blogs?: Blog[];
}) {
  setRequestLocale(locale);

  const blogs = prefetchedBlogs ?? [];

  if (!blogs || blogs.length === 0) return null;

  return <LatestBlogsClient blogs={blogs} />;
}
