"use client";

import React from "react";

/**
 * GlobalLoader — lightweight dots animation shown during page navigation
 * at the [locale] layout level. Replaces the old HomeSkeleton fallback
 * that was incorrectly showing on every page transition.
 */
const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block size-3 rounded-full bg-primary"
              style={{
                animation: "globalLoaderBounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          Loading...
        </p>
      </div>

      <style>{`
        @keyframes globalLoaderBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoader;
