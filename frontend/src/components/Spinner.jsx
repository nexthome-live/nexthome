import './Spinner.css'

export function Spinner({ size = 18, label }) {
  return (
    <span className="spinner" role="status" aria-label={label || 'Loading'}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="full-page-spinner" role="status" aria-live="polite">
      <Spinner size={32} />
      <span className="full-page-spinner__label">{label}</span>
    </div>
  )
}
