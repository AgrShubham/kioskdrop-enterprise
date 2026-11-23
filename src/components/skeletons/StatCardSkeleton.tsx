export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/80 animate-shimmer glass-chamfer">
      <div className="flex items-center justify-between mb-3">
        <div className="w-24 h-3.5 bg-muted rounded-md" />
        <div className="w-7 h-7 bg-muted rounded-lg" />
      </div>
      <div className="w-20 h-7 bg-muted rounded-lg mb-2" />
      <div className="w-36 h-3 bg-muted rounded-md" />
    </div>
  );
}

