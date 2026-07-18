export interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

export interface BlogTag {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string; // ISO string or formatted string like "09 Feb 2022"
  commentsCount: number;
  excerpt: string;
  content: string; // HTML or Markdown content
  image: string; // URL
  author?: {
    name: string;
    avatar?: string;
  };
}

export const mockCategories: BlogCategory[] = [
  { id: "c1", name: "Thermometers", count: 28 },
  { id: "c2", name: "Oximeters", count: 5 },
  { id: "c3", name: "BP Monitors", count: 1 },
  { id: "c4", name: "Personal Care", count: 1 },
];

export const mockTags: BlogTag[] = [
  { id: "t1", name: "Bestsellers" },
  { id: "t2", name: "Trends" },
  { id: "t3", name: "TrendingNow" },
  { id: "t4", name: "NewArrivals" },
];

export const mockBlogs: BlogPost[] = [
  {
    id: "b1",
    slug: "future-of-industrial-design-1",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog1/800/600", // We will place placeholder images
  },
  {
    id: "b2",
    slug: "future-of-industrial-design-2",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog2/800/600",
  },
  {
    id: "b3",
    slug: "future-of-industrial-design-3",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog3/800/600",
  },
  {
    id: "b4",
    slug: "future-of-industrial-design-4",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog4/800/600",
  },
  {
    id: "b5",
    slug: "future-of-industrial-design-5",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog5/800/600",
  },
  {
    id: "b6",
    slug: "future-of-industrial-design-6",
    title: "The Future of Industrial Design",
    category: "Category Name",
    date: "12:40 PM, 09 Feb 2022",
    commentsCount: 10,
    excerpt:
      "So you have heard about this site or you have been to it, but you cannot figure out.",
    content:
      "<p>So you have heard about this site or you have been to it, but you cannot figure out. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors in the performance of the search engine popularity of the links that are listed in the MTA directory. It is important that you buy links because the links are what get you the results that you want. The popularity of the links that are listed in the MTA directory is in fact one of the most important factors.</p>",
    image: "https://picsum.photos/seed/blog6/800/600",
  },
];
