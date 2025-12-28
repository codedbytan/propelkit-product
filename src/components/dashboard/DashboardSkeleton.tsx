import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-border/10 bg-background/50 flex items-center px-8 justify-between">
                <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-32 rounded" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Content Skeleton */}
            <div className="container max-w-6xl mx-auto p-8 space-y-8 animate-pulse">
                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-4 w-96 rounded" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-64 w-full rounded-2xl bg-secondary/20" />
                    <Skeleton className="h-64 w-full rounded-2xl bg-secondary/20" />
                </div>

                {/* Table */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded" />
                    <Skeleton className="h-48 w-full rounded-xl bg-secondary/20" />
                </div>
            </div>
        </div>
    );
}
