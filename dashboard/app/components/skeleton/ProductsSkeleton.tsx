import 'react-loading-skeleton/dist/skeleton.css';

export default function ProductsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded shadow bg-white space-y-3">
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-1/3 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Products Table Skeleton */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex justify-between items-center flex-wrap gap-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-32 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 grid grid-cols-7 gap-4 border-b">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 grid grid-cols-7 gap-4 items-center border-b"
          >
            <div className="flex items-center gap-3 col-span-2">
              <div className="w-12 h-12 bg-gray-300 rounded-[8px] animate-pulse"></div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse ml-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
