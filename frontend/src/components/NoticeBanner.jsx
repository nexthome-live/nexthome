import './NoticeBanner.css'

export function NoticeBanner() {
  return (
    <div className="notice-banner" role="status" aria-live="polite">
      <div className="notice-banner__inner">
        <span className="notice-banner__badge" aria-hidden="true">
          <svg
            className="notice-banner__icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2 1 21h22L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="17.5" r="1.1" fill="currentColor" />
          </svg>
        </span>
        <p className="notice-banner__text">
          <strong>Heads up:</strong> This nextHome app runs on free services and is still
          in testing — you may experience a little lag while operating.
        </p>
      </div>
    </div>
  )
}
