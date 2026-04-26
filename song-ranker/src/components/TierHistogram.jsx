import { getTierDistribution } from '../utils/matchmaking.js'

export default function TierHistogram({ songs }) {
  const dist = getTierDistribution(songs)
  const tiers = Object.keys(dist)
    .map(Number)
    .sort((a, b) => a - b)

  if (tiers.length === 0) return null

  const maxCount = Math.max(...tiers.map(t => dist[t].length))

  return (
    <div className="histogram">
      <h3 className="histogram__title">Tier Distribution</h3>
      <div className="histogram__chart">
        {tiers.map(tier => {
          const count = dist[tier].length
          const heightPct = (count / maxCount) * 100
          const isActive = count >= 2
          return (
            <div key={tier} className="histogram__col">
              <div className="histogram__bar-wrap">
                <div
                  className={`histogram__bar ${isActive ? 'histogram__bar--active' : 'histogram__bar--done'}`}
                  style={{ height: `${heightPct}%` }}
                  title={`Tier ${tier}: ${count} song${count !== 1 ? 's' : ''}`}
                />
              </div>
              <span className="histogram__label">{tier}</span>
            </div>
          )
        })}
      </div>
      <div className="histogram__legend">
        <span className="legend-dot legend-dot--active" /> 2+ songs (active)
        <span className="legend-dot legend-dot--done" style={{ marginLeft: 16 }} /> 1 song (settled)
      </div>
    </div>
  )
}
