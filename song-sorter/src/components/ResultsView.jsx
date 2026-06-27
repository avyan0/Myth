export default function ResultsView({ songsById, order, comparisons, partial, onReset, onClose }) {
  const body = (
    <div className="rankings-panel" onClick={e => e.stopPropagation()}>
      <div className="rankings-header">
        <h2>{partial ? 'Current Standings' : '🏆 Final Ranking'}</h2>
        <button className="rankings-close" onClick={onClose || onReset}>
          {onClose ? '✕' : ''}
        </button>
      </div>

      {!partial && (
        <p className="results-sub">
          Complete ranking in {comparisons} comparisons.
        </p>
      )}
      {partial && (
        <p className="results-sub">
          Most-sorted chunk so far ({order.length} songs). Sorting continues.
        </p>
      )}

      <div className="rankings-body">
        <ol className="results-list">
          {order.map(id => {
            const song = songsById[id]
            if (!song) return null
            return (
              <li key={id}>
                <a
                  className="tier-song"
                  href={`https://music.youtube.com/watch?v=${id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {song.thumbnail && <img src={song.thumbnail} alt="" className="tier-song__thumb" />}
                  <div className="tier-song__info">
                    <p className="tier-song__title">{song.title}</p>
                    <p className="tier-song__artist">{song.artist}</p>
                  </div>
                </a>
              </li>
            )
          })}
        </ol>

        {!partial && (
          <button className="btn-danger results-reset" onClick={onReset}>
            Start Over
          </button>
        )}
      </div>
    </div>
  )

  return <div className="rankings-overlay" onClick={onClose || (() => {})}>{body}</div>
}
