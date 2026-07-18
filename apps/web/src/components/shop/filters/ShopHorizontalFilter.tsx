"use client";
import React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ShopHorizontalFilter() {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <Button variant="outline" className="shrink-0 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          More Filters
        </Button>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] shrink-0 border-gray-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="home">Home & Garden</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="any">
          <SelectTrigger className="w-[120px] shrink-0 border-gray-200">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Price</SelectItem>
            <SelectItem value="under-50">Under $50</SelectItem>
            <SelectItem value="50-100">$50 to $100</SelectItem>
            <SelectItem value="over-100">Over $100</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[120px] shrink-0 border-gray-200">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="samsung">Samsung</SelectItem>
            <SelectItem value="nike">Nike</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500 whitespace-nowrap">
          Sort by:
        </span>
        <Select defaultValue="featured">
          <SelectTrigger className="w-[140px] border-none shadow-none font-medium text-gray-900 bg-gray-50">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
