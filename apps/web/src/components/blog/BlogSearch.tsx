"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Search } from "lucide-react";

const BlogSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="w-full h-12 bg-white border border-light-divider rounded-full pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-light-primary-text"
      />
      <button
        type="submit"
        className="absolute left-5 top-1/2 -translate-y-1/2"
      >
        <Search className="size-4 text-light-secondary-text hover:text-primary transition-colors" />
      </button>
    </form>
  );
};

export default BlogSearch;
