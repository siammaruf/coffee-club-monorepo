import React from "react";

export default function CustomerSkeleton() {
  return (
    <div className="divide-y">
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="p-4">
          <div className="grid grid-cols-4 text-sm items-center">
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="space-y-1 flex flex-col items-center">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}