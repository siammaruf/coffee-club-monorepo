import React from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { 
  Skeleton, 
  ProfileCardSkeleton, 
  HeaderSkeleton,
  InfoItemSkeleton 
} from './index';

export const EmployeeDetailsSkeleton = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <ProfileCardSkeleton />
          </CardContent>
        </Card>

        {/* Personal Information Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <InfoItemSkeleton key={index} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employment Details Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <InfoItemSkeleton key={index} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <InfoItemSkeleton key={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};