import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { UserCheck } from "lucide-react";

export default function AttendanceSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-gray-300" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              {index === 1 && <Skeleton className="h-4 w-24 mt-1" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-56" />
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
            <div className="grid grid-cols-8 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="py-4 border-b">
              <div className="grid grid-cols-8 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  {index % 2 === 0 && <Skeleton className="h-3 w-24 mt-1" />}
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  {index % 2 === 0 && <Skeleton className="h-3 w-20 mt-1" />}
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}