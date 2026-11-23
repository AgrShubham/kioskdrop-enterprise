export function LockerBaySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-2xl bg-card border border-border/80 p-3.5 flex flex-col justify-between animate-shimmer glass-chamfer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-4 bg-muted rounded" />
            <div className="w-5 h-5 bg-muted rounded-full" />
          </div>
          <div className="w-24 h-3 bg-muted rounded mt-2" />
          <div className="w-full h-8 bg-muted rounded-lg mt-3" />
        </div>
      ))}
    </div>
  );
}

