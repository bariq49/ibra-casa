export default function ComponentTypeSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="group relative bg-white  border rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            {/* Icon Skeleton */}
            <div className="w-12 h-12 rounded-lg bg-grey-200 "></div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-grey-200  rounded w-32"></div>
                <div className="h-5 bg-grey-200  rounded w-24"></div>
                <div className="h-5 bg-grey-200  rounded w-16"></div>
              </div>
              <div className="h-3 bg-grey-200  rounded w-full max-w-md"></div>
              <div className="h-3 bg-grey-200  rounded w-32"></div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-grey-200  rounded"></div>
              <div className="w-8 h-8 bg-grey-200  rounded"></div>
              <div className="w-8 h-8 bg-grey-200  rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
