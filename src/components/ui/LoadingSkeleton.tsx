// Lightweight loading skeleton component without external dependencies
import React from "react";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "h-4 bg-zinc-800 rounded",
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`animate-pulse ${className}`} />
      ))}
    </>
  );
};

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="bg-zinc-900 rounded-xl overflow-hidden">
        <LoadingSkeleton className="h-48 bg-zinc-800" />
        <div className="p-4">
          <LoadingSkeleton className="h-5 bg-zinc-800 rounded mb-2" />
          <LoadingSkeleton className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
          <LoadingSkeleton className="h-6 bg-zinc-600 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
