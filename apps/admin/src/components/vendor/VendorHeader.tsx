import { Search, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function VendorHeader({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vendor/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 bg-background/95 backdrop-blur border-b border-border px-4 md:px-6 w-full">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={() => setSidebarOpen(true)}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </Button>

      {/* Search Bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 items-center">
              <div className="relative transition-all duration-200 flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  type="search"
                  placeholder="Search products, orders…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${searchQuery ? "pr-10" : "pr-4"} bg-muted/50 transition-all duration-300 ${
                    searchFocused
                      ? "border-primary-main shadow-lg shadow-primary-main/20 focus:bg-background"
                      : "border-muted-foreground/20 focus:bg-background"
                  }`}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
                    onClick={handleClearSearch}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0 bg-primary-main hover:bg-primary-dark text-white animate-in fade-in zoom-in duration-200"
                >
                  Enter
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-4">
          <Link
            to="/vendor/settings"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-grey-700 hover:text-grey-900 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>

          {/* Current Time */}
          <div className="hidden lg:flex flex-col items-end text-xs">
            <span className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="font-medium">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
