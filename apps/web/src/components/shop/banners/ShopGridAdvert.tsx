"use client";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopGridAdvert() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col justify-between bg-emerald-50 rounded-2xl p-8 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
      <div className="z-10 relative">
        <span className="inline-block px-3 py-1 bg-white text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-sm">
          Premium
        </span>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
          Healthy Eating & Nutritional Wellness
        </h3>
        <p className="text-emerald-700 font-semibold text-lg flex items-center">
          Get Extra 50% Off
        </p>
      </div>

      <div className="z-10 relative mt-8">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full group-hover:scale-105 transition-transform px-6">
          Shop Now
          <div className="bg-white/20 p-1 rounded-full ml-2">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Button>
      </div>

      {/* Abstract Design Elements */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl group-hover:bg-emerald-300/50 transition-colors"></div>
      <div className="absolute top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-2xl"></div>
    </div>
  );
}
