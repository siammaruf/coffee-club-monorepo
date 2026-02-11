import React from 'react';

// Base Skeleton Component
export const Skeleton = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      {...props}
    />
  );
};

// Profile Card Skeleton
export const ProfileCardSkeleton = () => {
  return (
    <div className="text-center">
      <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
      <Skeleton className="h-6 w-32 mx-auto mb-2" />
      <Skeleton className="h-4 w-24 mx-auto mb-3" />
      <Skeleton className="h-6 w-20 mx-auto" />
    </div>
  );
};

// Information Item Skeleton
export const InfoItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-5" />
      <div className="flex-1">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
};

// Button Skeleton
export const ButtonSkeleton = ({ width = 'w-20' }: { width?: string }) => {
  return <Skeleton className={`h-10 ${width}`} />;
};

// Header Skeleton
export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <ButtonSkeleton width="w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-2">
        <ButtonSkeleton width="w-16" />
        <ButtonSkeleton width="w-24" />
        <ButtonSkeleton width="w-20" />
      </div>
    </div>
  );
};