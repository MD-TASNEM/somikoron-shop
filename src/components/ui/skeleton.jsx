import { cn } from '@/lib/utils';



export function Skeleton({ className, variant = 'default', animation = 'pulse', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-medium-gray',
        {
          'h-4 w-full': variant === 'text',
          'h-12 w-12 rounded-full': variant === 'circular',
          'h-24 w-full': variant === 'rectangular',
          'h-4 w-4': variant === 'default',
        },
        animation === 'none' && 'animate-none',
        animation === 'wave' && 'animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

// Product skeleton loader
export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <Skeleton className="h-48 w-full" variant="rectangular" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
        </div>
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-3 w-1/2" variant="text" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" variant="text" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="flex items-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3" variant="circular" />
          ))}
          <Skeleton className="h-3 w-12" variant="text" />
        </div>
      </div>
    </div>
  );
}

// Product grid skeleton loader
export function ProductGridSkeleton({ count = 8 }: { count?) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-medium-gray p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" variant="text" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          
            <tr className="border-b border-medium-gray bg-light-bg">
              {[...Array(columns)].map((_, index) => (
                <th key={index} className="text-left py-3 px-4">
                  <Skeleton className="h-4 w-20" variant="text" />
                </th>
              ))}
            </tr>
          </thead>
          
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-medium-gray">
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-medium-gray p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" variant="text" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart skeleton loader
export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-lg" variant="rectangular" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" variant="text" />
              <Skeleton className="h-3 w-1/2" variant="text" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" variant="circular" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Order skeleton loader
export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" variant="text" />
            <Skeleton className="h-3 w-48" variant="text" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        
        <div className="border-t border-medium-gray pt-4">
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-lg" variant="rectangular" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" variant="text" />
                  <Skeleton className="h-3 w-1/2" variant="text" />
                </div>
                <Skeleton className="h-4 w-16" variant="text" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-medium-gray pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" variant="text" />
              <Skeleton className="h-3 w-16" variant="text" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" variant="text" />
              <Skeleton className="h-3 w-16" variant="text" />
            </div>
            <div className="flex justify-between border-t border-medium-gray pt-2">
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-4 w-20" variant="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category skeleton loader
export function CategorySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <Skeleton className="h-32 w-full" variant="rectangular" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-8 w-24" variant="text" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mx-auto" variant="text" />
        <Skeleton className="h-3 w-1/2 mx-auto mt-2" variant="text" />
      </div>
    </div>
  );
}

// User skeleton loader
export function UserSkeleton() {
  return (
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" variant="text" />
        <Skeleton className="h-3 w-24" variant="text" />
      </div>
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-primary border-t-transparent border-r-transparent border-b-transparent', sizeClasses[size], className)} />
  );
}

// Page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-light-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" variant="text" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <ProductGridSkeleton count={8} />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <Skeleton className="h-6 w-32" variant="text" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" variant="circular" />
                      <Skeleton className="h-3 w-24" variant="text" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
