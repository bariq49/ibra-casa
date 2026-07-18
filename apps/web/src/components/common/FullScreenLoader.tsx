"use client";

import React from "react";

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader = ({
  message = "Loading...",
}: FullScreenLoaderProps) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300">
    <div className="bg-white p-10 rounded-[24px] flex flex-col items-center gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transform animate-in zoom-in-95 duration-300 max-w-sm w-[90%] mx-auto text-center border border-border">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-urbanist font-bold text-2xl text-slate-800">
          {message}
        </p>
        <p className="font-dm-sans text-[15px] text-slate-500">
          Please wait while we securely process your request. Do not close or refresh this page.
        </p>
      </div>
    </div>
  </div>
);

export default FullScreenLoader;
