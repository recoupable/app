const UsageSkeleton = () => (
  <div className="space-y-2" aria-busy="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
    ))}
  </div>
);

export default UsageSkeleton;
