import React from "react";
import ShopLayoutEngine from "@/components/shop/ShopLayoutEngine";
import Container from "@/components/common/Container";
import { Link } from "@/i18n/routing";
import { Home, ChevronRight } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  return {
    title: query
      ? `Search results for "${query}" - Kids Store`
      : "Search - Kids Store",
  };
}

export default async function SearchPage({
  searchParams,
  params,
}: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;

  const q = resolvedSearchParams.q;
  const searchQuery = typeof q === "string" ? q : "";
  const locale = resolvedParams.locale;

  return (
    <main className="min-h-screen bg-gray-50/30">
      {/* Breadcrumb & Header */}
      <div className="bg-gray-100/50 border-b border-gray-200 py-6">
        <Container>
          <div className="flex flex-col gap-2">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home className="size-4" />
                Home
              </Link>
              <ChevronRight className="size-4" />
              <span className="text-foreground font-medium">
                Search Results
              </span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {searchQuery ? (
                <>
                  Search results for{" "}
                  <span className="text-primary">"{searchQuery}"</span>
                </>
              ) : (
                "Search our store"
              )}
            </h1>
          </div>
        </Container>
      </div>

      {/* Render the standard layout engine with search parameter applied */}
      <ShopLayoutEngine
        layoutSlug="4-columns-left-filter"
        locale={locale}
        searchQuery={searchQuery}
      />
    </main>
  );
}
