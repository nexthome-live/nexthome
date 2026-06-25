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

// Gmail web compose helper. We always go through Gmail on the web (never
// `mailto:`) so the user's OS default mail client — Outlook on Windows —
// never opens in the background alongside the new tab.
function buildGmailComposeUrl(vacancy) {
  const to = vacancy.contactEmail
  if (!to) return null
  const { subject, body } = buildInquiryMessage(vacancy)
  // Gmail expects the `to` query to be a comma-separated list of addresses.
  // We pass subject/body separately so Gmail puts them in the right fields.
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
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

export function VacancyCard({ vacancy, onManage, isActive }) {
  const badge = getRoomBadge(vacancy.roomType)
  const gmailUrl = buildGmailComposeUrl(vacancy)
  const contactDisabled = !gmailUrl

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
          // without ever invoking the OS default mail client (Outlook on Windows).
          <a
            className="btn btn--outline btn--sm"
            href={gmailUrl}
            target="_blank"
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
