import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function EmployeesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            {/* Employee List Title Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Filters Skeleton */}
            <div className="flex gap-4 items-center">
              {/* Position Filter */}
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
              {/* Status Filter */}
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
              {/* Search Box */}
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            {/* Table Header Skeleton */}
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-6 font-medium text-sm">
                <div className="text-left">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-14 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </div>
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-6 text-sm items-center">
                    {/* Name Column with Avatar */}
                    <div className="flex items-center gap-3 text-left">
                      {/* Avatar Skeleton */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                      {/* Name Skeleton */}
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Role Column */}
                    <div className="text-center">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>

                    {/* Email Column */}
                    <div className="text-center">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>

                    {/* Phone Column */}
                    <div className="text-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>

                    {/* Status Column */}
                    <div className="text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-2 justify-end">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between pt-4">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}