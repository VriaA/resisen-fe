export default function LoadingSkeleton() {
  return (
    <div className="card-result-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="w-full h-105 animate-pulse rounded-3xl loading-skeleton-animation"
        />
      ))}
    </div>
  );
}
