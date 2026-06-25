import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import './Home.css'

const FEATURES = [
  {
    icon: <Icon.Map />,
    title: 'Local-first',
    desc: 'Discover rentals in your neighborhood and the streets you know.',
  },
  {
    icon: <Icon.Sparkles />,
    title: 'Quick post',
    desc: 'Share a room in under a minute. No clutter, no friction.',
  },
  {
    icon: <Icon.Check />,
    title: 'You stay in control',
    desc: 'A management token keeps updates and removals in your hands.',
  },
]

export function Home({ onSelect, totalVacancies = 0 }) {
  return (
    <section className="home-screen">
      <div className="home-hero">
        <div className="home-hero__content">
          <span className="home-eyebrow">
            <Icon.Sparkles width={14} height={14} /> Room & home marketplace
          </span>
          <h1 className="home-title">
            Find a place to <span className="home-title__accent">rent nearby</span>.
          </h1>
          <p className="home-subtitle">
            nextHome helps you post a vacancy or browse rentals near you.
            Built for people who'd rather get to a place than scroll forever.
          </p>
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat__value">{totalVacancies}</span>
              <span className="home-stat__label">Live vacancies</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">2 min</span>
              <span className="home-stat__label">Avg. post time</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">100%</span>
              <span className="home-stat__label">Your control</span>
            </div>
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-illu">
            <div className="home-illu__blob" />
            <div className="home-illu__blob home-illu__blob--alt" />
            <div className="home-illu__card home-illu__card--top">
              <span className="home-illu__card-icon"><Icon.Home /></span>
              <span>2BR in South Austin</span>
            </div>
            <div className="home-illu__card home-illu__card--middle">
              <span className="home-illu__card-icon"><Icon.Map /></span>
              <span>East Side • 1.2 mi</span>
            </div>
            <div className="home-illu__card home-illu__card--bottom">
              <span className="home-illu__card-icon"><Icon.Sparkles /></span>
              <span>Just listed today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-actions">
        <div
          className="home-action"
          role="button"
          tabIndex={0}
          onClick={() => onSelect('post')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('post') } }}
        >
          <div className="home-action__icon"><Icon.Plus width={28} height={28} /></div>
          <h2 className="home-action__title">Post a vacancy</h2>
          <p className="home-action__description">
            Have a room or home available? Share the details and reach people nearby in minutes.
          </p>
          <Button
            variant="primary"
            size="md"
            className="home-action__cta"
            trailingIcon={<Icon.ArrowRight width={16} height={16} />}
            tabIndex={-1}
          >
            Get started
          </Button>
        </div>

        <div
          className="home-action home-action--secondary"
          role="button"
          tabIndex={0}
          onClick={() => onSelect('view')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('view') } }}
        >
          <div className="home-action__icon"><Icon.Search width={28} height={28} /></div>
          <h2 className="home-action__title">Browse vacancies</h2>
          <p className="home-action__description">
            See what others have posted. Filter by city, find a place that fits, and reach out.
          </p>
          <Button
            variant="outline"
            size="md"
            className="home-action__cta"
            trailingIcon={<Icon.ArrowRight width={16} height={16} />}
            tabIndex={-1}
          >
            See listings
          </Button>
        </div>
      </div>

      <div className="home-features">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="home-feature">
            <div className="home-feature__icon">{feature.icon}</div>
            <div>
              <div className="home-feature__title">{feature.title}</div>
              <div className="home-feature__desc">{feature.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
