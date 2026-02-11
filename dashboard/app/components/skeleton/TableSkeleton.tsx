import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Table as TableIcon } from "lucide-react";

export default function TableSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-gray-300" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div>
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index} className={`border-${index === 0 ? 'green' : index === 1 ? 'blue' : index === 2 ? 'yellow' : 'red'}-300`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Filters Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header Skeleton */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-7 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="py-4 border-b">
              <div className="grid grid-cols-7 gap-4 items-center">
                <Skeleton className="h-5 w-16" />
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-40" />
                <div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div>
                  {index % 2 === 0 ? (
                    <>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <Skeleton className="h-5 w-16" />
                  )}
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}