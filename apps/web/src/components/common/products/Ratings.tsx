import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingsProps {
  rating: number; // 0-5 stars
  totalReviews?: number;
  className?: string;
  iconClassName?: string;
}

const StarIcon = ({
  percentage,
  iconClassName,
}: {
  percentage: number;
  iconClassName?: string;
}) => {
  const isFull = percentage >= 100;
  const isEmpty = percentage <= 0;

  if (isFull) {
    return (
      <Star
        className={cn("w-4 h-4 text-warning fill-[#FFB800]", iconClassName)}
      />
    );
  }

  if (isEmpty) {
    return (
      <Star
        className={cn("w-4 h-4 text-gray-200 fill-gray-200", iconClassName)}
      />
    );
  }

  // Partial star
  return (
    <div className="relative">
      <Star
        className={cn("w-4 h-4 text-gray-200 fill-gray-200", iconClassName)}
      />
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width: `${percentage}%` }}
      >
        <Star
          className={cn(
            "w-4 h-4 text-warning fill-[#FFB800])",
            iconClassName,
          )}
        />
      </div>
    </div>
  );
};

const Ratings = ({
  rating,
  totalReviews,
  className,
  iconClassName,
}: RatingsProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(
            0,
            Math.min(100, (rating - (starIndex - 1)) * 100),
          );
          return (
            <StarIcon
              key={starIndex}
              percentage={fillPercentage}
              iconClassName={iconClassName}
            />
          );
        })}
      </div>

      {totalReviews !== undefined && (
        <span className="text-sm leading-[22px] font-normal inline-block ml-1 text-muted-foreground">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default Ratings;
