import { Button } from './Button'
import { Icon } from './Icon'
import './VacancyCard.css'

function formatRent(rent) {
  if (rent == null) return '—'
  const n = typeof rent === 'string' ? Number(rent) : Number(rent)
  if (!Number.isFinite(n)) return String(rent)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(d)
  } catch { return '' }
}

function buildInquiryMessage(vacancy) {
  const subject = `Inquiry about your nexthome listing: ${vacancy.title || 'Vacancy'}`
  const body = [
    `Hi ${vacancy.createdBy || 'there'},`,
    '',
    `I came across your listing "${vacancy.title || ''}" on nexthome and I'm interested in learning more.`,
    '',
    'Could you please share your contact details, including your mobile number, so we can discuss this further at a convenient time?',
    '',
    'Looking forward to hearing from you.',
    '',
    'Thanks,',
    'A nexthome renter',
  ].join('\n')
  return { subject, body }
}

// Lightweight platform detection — used only to pick the right mail intent
// for mobile (Android/iOS). We deliberately avoid feature-detection
// libraries so this file stays dependency-free.
function detectPlatform() {
  if (typeof navigator === 'undefined') return { os: 'desktop', isMobile: false }
  const ua = (navigator.userAgent || '').toLowerCase()
  const isAndroid = /android/.test(ua)
  const isIOS = /iphone|ipad|ipod/.test(ua) ||
    (ua.includes('mac') && typeof document !== 'undefined' && document.documentElement?.dataset?.touch === 'true')
  const isMobile = isAndroid || isIOS
  return { os: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop', isMobile }
}

// Build an Android `intent://` URL that opens the Gmail app's compose screen
// pre-filled with to/subject/body. Falls back to Gmail web if Gmail is not
// installed (Chrome handles the fallback automatically when `S.browser_fallback_url`
// is present and the intent can't be resolved).
//   Ref: https://developer.chrome.com/docs/multidevice/android/intents
function buildAndroidGmailIntent({ to, subject, body }) {
  // Browser fallback used when the Gmail package isn't installed — Chrome
  // will load this URL automatically via `S.browser_fallback_url`.
  const fallback = `https://mail.google.com/mail/?${new URLSearchParams({
    view: 'cm', fs: '1', to, su: subject, body,
  }).toString()}`
  // Compose intent targeting the Gmail app (com.google.android.gm) with our
  // template pre-filled. The `mailto:` scheme is the universal "open a
  // compose window" intent on Android, and Gmail respects SENDTO extras.
  return `intent:mailto:${to}` +
    `#Intent;scheme=mailto;` +
    `action=android.intent.action.SENDTO;` +
    `package=com.google.android.gm;` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};` +
    `S.android.intent.extra.SUBJECT=${encodeURIComponent(subject)};` +
    `S.android.intent.extra.TEXT=${encodeURIComponent(body)};` +
    `end`
}

// iOS uses the Gmail app's custom URL scheme. If the user doesn't have
// Gmail installed the link will silently fail, so we also expose a
// `googlegmail://co?to=...&subject=...&body=...` link and rely on
// `mailto:` as the real fallback.
function buildIOSGmailUrl({ to, subject, body }) {
  const params = new URLSearchParams({ to, subject, body })
  return `googlegmail://co?${params.toString()}`
}

function buildMailtoUrl({ to, subject, body }) {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${to}?${params.toString()}`
}

function buildGmailComposeUrl(vacancy) {
  const to = vacancy.contactEmail
  if (!to) return null
  const { subject, body } = buildInquiryMessage(vacancy)
  return {
    primary: { to, subject, body },
  }
}

const ROOM_BADGE = {
  PRIVATE:   { label: 'Private Room',   tone: 'blue' },
  SHARED:    { label: 'Shared',         tone: 'amber' },
  STUDIO:    { label: 'Studio',         tone: 'violet' },
  APARTMENT: { label: 'Apartment',      tone: 'green' },
}

function getRoomBadge(roomType) {
  if (!roomType) return { label: '—', tone: 'gray' }
  const key = String(roomType).toUpperCase()
  return ROOM_BADGE[key] || { label: roomType, tone: 'gray' }
}

// Module-scope click handler so the React 19 purity rule doesn't flag
// `window.location.href = ...` (which is a side effect that is perfectly
// valid inside an event handler). Pulled out of the component body for
// exactly that reason.
function handleContactClick(e, platform, compose) {
  if (!compose) return
  if (!platform.isMobile) return // desktop uses the <a target="_blank"> default
  e.preventDefault()
  const { to, subject, body } = compose.primary

  if (platform.os === 'android') {
    // `intent://` URLs only work as a top-level navigation, never inside
    // an `<a target="_blank">`. Chrome handles the fallback URL itself
    // when the Gmail package isn't installed.
    window.location.href = buildAndroidGmailIntent({ to, subject, body })
    return
  }

  // iOS / iPadOS: try the Gmail app via its custom scheme first. If the
  // user doesn't have Gmail installed the navigation silently fails
  // (the page stays visible) and we fall back to `mailto:`.
  const start = Date.now()
  window.location.href = buildIOSGmailUrl({ to, subject, body })
  setTimeout(() => {
    if (typeof document !== 'undefined' &&
        document.visibilityState === 'visible' &&
        Date.now() - start < 1500) {
      window.location.href = buildMailtoUrl({ to, subject, body })
    }
  }, 1000)
}

function buildDesktopGmailUrl({ to, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body })
  return `https://mail.google.com/mail/?${params.toString()}`
}

function getContactHref(platform, compose) {
  if (!compose) return null
  const { to, subject, body } = compose.primary
  if (platform.os === 'android') {
    return buildAndroidGmailIntent({ to, subject, body })
  }
  if (platform.os === 'ios') {
    return buildIOSGmailUrl({ to, subject, body })
  }
  // Desktop: keep the Gmail-web-in-new-tab behavior so we don't accidentally
  // fire up Outlook on Windows.
  return buildDesktopGmailUrl({ to, subject, body })
}

export function VacancyCard({ vacancy, onManage, isActive }) {
  const badge = getRoomBadge(vacancy.roomType)
  const compose = buildGmailComposeUrl(vacancy)
  const contactDisabled = !compose
  const platform = detectPlatform()
  const contactHref = getContactHref(platform, compose)
  const onContactClick = (e) => handleContactClick(e, platform, compose)

  return (
    <article className={`vcard ${isActive ? 'vcard--active' : ''}`}>
      <header className="vcard__head">
        <div className="vcard__heading">
          <span className={`vcard__chip vcard__chip--${badge.tone}`}>{badge.label}</span>
          <h3 className="vcard__title">{vacancy.title}</h3>
        </div>
        <div className="vcard__rent">
          <span className="vcard__rent-value">${formatRent(vacancy.rent)}</span>
          <span className="vcard__rent-suffix">/month</span>
        </div>
      </header>

      {vacancy.description && <p className="vcard__desc">{vacancy.description}</p>}

      <dl className="vcard__meta">
        <div className="vcard__meta-item">
          <dt>📍 City</dt>
          <dd>{vacancy.city || '—'}</dd>
        </div>
        {vacancy.address && (
          <div className="vcard__meta-item">
            <dt>🏠 Address</dt>
            <dd>{vacancy.address}</dd>
          </div>
        )}
        <div className="vcard__meta-item">
          <dt>👤 Posted by</dt>
          <dd>{vacancy.createdBy || '—'}</dd>
        </div>
        {vacancy.contactEmail && (
          <div className="vcard__meta-item">
            <dt>✉️ Contact</dt>
            <dd className="vcard__contact-email">{vacancy.contactEmail}</dd>
          </div>
        )}
        {vacancy.createdAt && (
          <div className="vcard__meta-item">
            <dt>📅 Posted on</dt>
            <dd>{formatDate(vacancy.createdAt)}</dd>
          </div>
        )}
      </dl>

      <footer className="vcard__foot">
        {contactDisabled ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            leadingIcon={<Icon.Mail width={16} height={16} />}
            title="No contact email on this listing"
          >
            Contact poster
          </Button>
        ) : (
          // Render as a real <a> so the browser opens Gmail in a new tab
          // on desktop (avoids firing up Outlook on Windows). On mobile
          // `handleContactClick` takes over and navigates the current tab
          // to the right native intent.
          <a
            className="btn btn--outline btn--sm"
            href={contactHref}
            onClick={onContactClick}
            target={platform.isMobile ? '_self' : '_blank'}
            rel="noopener noreferrer"
            title={`Email ${vacancy.contactEmail} via Gmail`}
          >
            <span className="btn__icon" aria-hidden="true">
              <Icon.Mail width={16} height={16} />
            </span>
            <span className="btn__label">Contact poster</span>
          </a>
        )}
        <Button
          variant={isActive ? 'primary' : 'secondary'}
          size="sm"
          onClick={onManage}
        >
          {isActive ? 'Managing this vacancy' : 'Manage'}
        </Button>
      </footer>
    </article>
  )
}
