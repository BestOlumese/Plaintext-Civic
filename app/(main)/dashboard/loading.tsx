import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-10 px-4 lg:px-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-row items-start sm:items-center justify-between w-full mb-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-6 w-96 hidden sm:block" />
          </div>
          <div className="shrink-0 ml-4">
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>

        {/* Upload Dropzone Skeleton */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
             <div className="space-y-2">
               <Skeleton className="h-5 w-40" />
               <Skeleton className="h-4 w-64" />
             </div>
             <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>

        {/* Documents Grid Skeleton */}
        <div>
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-5 pb-4 border-b border-slate-50 bg-slate-50/30 flex justify-between">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="p-5 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
