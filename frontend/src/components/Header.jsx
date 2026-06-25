import './Header.css'

export function Header({ onHome, canGoHome = true, rightSlot }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="brand"
          onClick={onHome}
          disabled={!canGoHome}
          aria-label="Go to home"
        >
          <span className="brand__wordmark">
            <span className="brand__name">next</span>
            <span className="brand__home" aria-hidden="true">
              <svg
                className="brand__home-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
          <span className="brand__tag">Find rentals. Feel at home.</span>
        </button>
        {rightSlot && <div className="app-header__right">{rightSlot}</div>}
      </div>
    </header>
  )
}
