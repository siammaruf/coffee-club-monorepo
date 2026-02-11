import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function CategoriesLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="relative w-64">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-4 font-medium text-sm">
                <div className="text-left">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </div>
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-4 text-sm items-center">
                    <div className="text-left flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-200 animate-pulse flex-shrink-0"></div>
                      <div className="flex flex-col flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>
                    <div className="flex justify-end">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
