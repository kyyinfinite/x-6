export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass rounded-2xl p-4 border border-white/5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-14 h-3" />
      </div>
      <Skeleton className="w-20 h-3 mb-2" />
      <Skeleton className="w-24 h-6 mb-2" />
      <Skeleton className="w-16 h-3" />
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 border border-white/5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-1/3 h-2.5" />
      </div>
    </div>
  );
}
