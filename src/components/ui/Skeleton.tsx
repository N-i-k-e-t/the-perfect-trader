'use client';

export function Skeleton({
    className = '',
}: {
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200/80 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite] ${className}`}
            aria-hidden
        />
    );
}

export function TodayPageSkeleton() {
    return (
        <div className="w-full flex flex-col items-center px-5 pt-4 gap-6">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-56 w-56 rounded-full" />
            <div className="w-full grid grid-cols-2 gap-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-[32px]" />
            <Skeleton className="h-16 w-full rounded-[24px]" />
            <Skeleton className="h-16 w-full rounded-[24px]" />
        </div>
    );
}

export function JournalPageSkeleton() {
    return (
        <div className="w-full flex flex-col px-5 pt-4 gap-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-14 w-full rounded-[32px]" />
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-[32px]" />
            ))}
        </div>
    );
}
