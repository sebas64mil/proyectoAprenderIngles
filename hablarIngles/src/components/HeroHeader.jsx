import StatCard from './StatCard'

export default function HeroHeader({ eyebrow, title, description, stats }) {
  return (
    <header className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-text">{description}</p>
      </div>

      <div className="hero-stats">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>
    </header>
  )
}