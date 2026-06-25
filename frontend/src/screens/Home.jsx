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
          <div className="home-pinpoint">
            {/* Soft ambient orb behind everything — adds depth without
                competing with the focal point. */}
            <span className="home-pinpoint__orb" />

            {/* The main glass card — a stylized map fragment. */}
            <div className="home-pinpoint__card">
              <div className="home-pinpoint__map">
                {/* Faint street grid */}
                <span className="home-pinpoint__grid" />
                <span className="home-pinpoint__street home-pinpoint__street--h1" />
                <span className="home-pinpoint__street home-pinpoint__street--h2" />
                <span className="home-pinpoint__street home-pinpoint__street--h3" />
                <span className="home-pinpoint__street home-pinpoint__street--v1" />
                <span className="home-pinpoint__street home-pinpoint__street--v2" />
                <span className="home-pinpoint__street home-pinpoint__street--v3" />

                {/* A soft neighborhood block — implies "a place". */}
                <span className="home-pinpoint__block home-pinpoint__block--a" />
                <span className="home-pinpoint__block home-pinpoint__block--b" />
                <span className="home-pinpoint__block home-pinpoint__block--c" />

                {/* The pin: drops in, lands, rings ripple out, gentle
                    float for the rest of the loop. */}
                <span className="home-pinpoint__ripple" />
                <span className="home-pinpoint__ripple home-pinpoint__ripple--2" />
                <span className="home-pinpoint__pin">
                  <span className="home-pinpoint__pin-head" />
                  <span className="home-pinpoint__pin-stem" />
                  <span className="home-pinpoint__pin-dot" />
                </span>
              </div>
            </div>

            {/* Floating listing card — communicates "discover places". */}
            <div className="home-pinpoint__listing">
              <span className="home-pinpoint__listing-thumb" />
              <span className="home-pinpoint__listing-lines">
                <span className="home-pinpoint__listing-line home-pinpoint__listing-line--title" />
                <span className="home-pinpoint__listing-line home-pinpoint__listing-line--meta" />
              </span>
            </div>

            {/* Tiny distance chip — reinforces "nearby". */}
            <div className="home-pinpoint__chip">
              <Icon.Map width={14} height={14} />
              <span>0.8 mi</span>
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
