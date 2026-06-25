import './Skeleton.css'

export function Skeleton({ width, height = 16, radius = 'var(--radius-sm)', style }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton width="60%" height={20} />
      <Skeleton width="90%" />
      <Skeleton width="40%" />
      <Skeleton width="80%" />
    </div>
  )
}
