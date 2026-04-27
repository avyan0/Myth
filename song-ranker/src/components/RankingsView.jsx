import { getTierDistribution } from '../utils/matchmaking.js'

export default function RankingsView({ songs, onClose }) {
  const dist = getTierDistribution(songs)
  const tiers = Object.keys(dist).map(Number).sort((a, b) => b - a) // highest first

  return (
    <div className="rankings-overlay" onClick={onClose}>
      <div className="rankings-panel" onClick={e => e.stopPropagation()}>
        <div className="rankings-header">
          <h2>All Rankings</h2>
          <button className="rankings-close" onClick={onClose}>✕</button>
        </div>

        <div className="rankings-body">
          {tiers.map(tier => {
            const group = dist[tier]
            const sorted = [...group].sort((a, b) => b.wins - a.wins)
            return (
              <div key={tier} className="tier-section">
                <div className="tier-section__heading">
                  <span className="tier-section__number">Tier {tier}</span>
                  <span className="tier-section__count">{group.length} song{group.length !== 1 ? 's' : ''}</span>
                  {group.length >= 2 && <span className="tier-section__active">active</span>}
                </div>
                <div className="tier-section__songs">
                  {sorted.map(song => (
                    <a
                      key={song.id}
                      className="tier-song"
                      href={`https://www.youtube.com/watch?v=${song.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {song.thumbnail && (
                        <img src={song.thumbnail} alt="" className="tier-song__thumb" />
                      )}
                      <div className="tier-song__info">
                        <p className="tier-song__title">{song.title}</p>
                        <p className="tier-song__artist">{song.artist}</p>
                      </div>
                      <div className="tier-song__stats">
                        <span>{song.wins}W</span>
                        <span>{song.losses}L</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
