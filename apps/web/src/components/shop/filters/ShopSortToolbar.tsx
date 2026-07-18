"use client";
import React from "react";
import { List, SlidersHorizontal } from "lucide-react";

export type ViewModeType = "list" | "grid-2" | "grid-3" | "grid-4" | "grid-5";

interface ShopSortToolbarProps {
  totalResults: number;
  currentResultCount: number;
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onOpenMobileFilters?: () => void;
  hasLeftFilter?: boolean;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ColumnIcon = ({ cols }: { cols: number }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {cols === 2 && (
        <>
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="11" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </>
      )}
      {cols === 3 && (
        <>
          <rect x="2" y="3" width="4" height="6" rx="0.5" />
          <rect x="8" y="3" width="4" height="6" rx="0.5" />
          <rect x="14" y="3" width="4" height="6" rx="0.5" />
          <rect x="2" y="11" width="4" height="6" rx="0.5" />
          <rect x="8" y="11" width="4" height="6" rx="0.5" />
          <rect x="14" y="11" width="4" height="6" rx="0.5" />
        </>
      )}
      {cols === 4 && (
        <>
          <rect x="1.5" y="3" width="3" height="6" rx="0.5" />
          <rect x="6" y="3" width="3" height="6" rx="0.5" />
          <rect x="10.5" y="3" width="3" height="6" rx="0.5" />
          <rect x="15" y="3" width="3" height="6" rx="0.5" />
          <rect x="1.5" y="11" width="3" height="6" rx="0.5" />
          <rect x="6" y="11" width="3" height="6" rx="0.5" />
          <rect x="10.5" y="11" width="3" height="6" rx="0.5" />
          <rect x="15" y="11" width="3" height="6" rx="0.5" />
        </>
      )}
      {cols === 5 && (
        <>
          <rect x="1" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="4.6" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="8.2" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="11.8" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="15.4" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="1" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="4.6" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="8.2" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="11.8" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="15.4" y="11" width="2.4" height="6" rx="0.5" />
        </>
      )}
    </svg>
  );
};

export default function ShopSortToolbar({
  totalResults,
  currentResultCount,
  viewMode,
  onViewModeChange,
  sortBy = "default",
  onSortChange,
  limit = 25,
  onLimitChange,
  onOpenMobileFilters,
  hasLeftFilter = false,
}: ShopSortToolbarProps) {
  return (
    <div className="bg-light-bg rounded-[16px] flex flex-col xl:flex-row xl:items-center justify-between p-[10px_24px] w-full min-h-[60px] gap-4">
      {/* Left side: View toggles & Results count & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-[16px] sm:gap-[24px]">
        {/* View toggles */}
        <div className="hidden sm:flex items-center gap-[4px] md:gap-[8px] bg-white p-1 rounded-lg border border-light-border/50">
           {(["list", "grid-2", "grid-3", "grid-4", "grid-5"] as ViewModeType[]).map((mode) => {
             const isGrid = mode.startsWith("grid");
             const cols = isGrid ? parseInt(mode.split("-")[1]) : 0;
             const isSelected = viewMode === mode;
             
             // Hide higher column options on smaller screens
             let displayClass = "flex items-center justify-center size-[32px] md:size-[36px] rounded-[6px] transition-colors";
             if (mode === "grid-3") displayClass += " hidden md:flex";
             if (mode === "grid-4") displayClass += " hidden lg:flex";
             if (mode === "grid-5") displayClass += " hidden xl:flex";

             return (
               <button
                 key={mode}
                 onClick={() => onViewModeChange(mode)}
                 className={`${displayClass} ${
                   isSelected
                     ? "bg-primary/10 text-primary shadow-sm"
                     : "text-muted-foreground hover:bg-card hover:text-primary"
                 }`}
                 title={isGrid ? `${cols} Columns` : "List View"}
               >
                 {mode === "list" ? <List className="size-[18px]" /> : <ColumnIcon cols={cols} />}
               </button>
             );
           })}
        </div>

        {/* Mobile Filter Toggle (Main) */}
        <div className="flex items-center gap-4">
          {hasLeftFilter && (
            <button
              onClick={onOpenMobileFilters}
              className="xl:hidden flex items-center justify-center h-[36px] px-3 gap-2 bg-white rounded-[6px] border border-light-border/50 text-muted-foreground hover:text-primary font-dm-sans text-[14px] sm:text-sm font-medium shadow-sm transition-colors"
              title="Open Filters"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
          )}

          {/* Results text */}
          <p className="font-dm-sans text-[14px] md:text-[16px] leading-[26px] text-light-secondary-text">
            Showing <span className="font-semibold text-light-primary-text">1–{currentResultCount}</span> of <span className="font-semibold text-light-primary-text">{totalResults}</span> results
          </p>
        </div>
      </div>

      {/* Right side: Limit and Sort Dropdowns */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[12px] md:gap-[20px]">
        {/* Output Limit */}
        <div className="flex items-center gap-[8px] md:gap-[12px]">
          <span className="font-dm-sans text-[14px] md:text-[16px] leading-[26px] text-light-secondary-text whitespace-nowrap">
            Show:
          </span>
          <Select value={limit.toString()} onValueChange={(val) => onLimitChange?.(Number(val))}>
             <SelectTrigger className="w-[100px] h-[40px] bg-card border-light-border font-dm-sans font-medium text-[14px] md:text-[16px]">
                <SelectValue placeholder="25" />
             </SelectTrigger>
             <SelectContent className="font-dm-sans">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
             </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-[8px] md:gap-[12px]">
          <span className="font-dm-sans text-[14px] md:text-[16px] leading-[26px] text-light-secondary-text whitespace-nowrap">
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={(val) => onSortChange?.(val)}>
            <SelectTrigger className="w-[160px] md:w-[200px] h-[40px] bg-card border-light-border font-dm-sans font-medium text-[14px] md:text-[16px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="font-dm-sans">
              <SelectItem value="default">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
