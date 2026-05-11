import ErrorBoundary from './ErrorBoundary.jsx'

// Plain YouTube iframe — no JS API, nothing to crash.
// The load-time filter already strips deleted/private videos.
// Songs with embedding disabled show YT's own "unavailable" screen inside
// the iframe, which is fine — React never sees it as an error.
function SongCardInner({ song, onVote }) {
  const src =
    `https://www.youtube-nocookie.com/embed/${song.id}` +
    `?controls=1&rel=0&modestbranding=1&fs=1`

  return (
    <div className="song-card" onClick={onVote}>
      <div className="song-card__player" onClick={e => e.stopPropagation()}>
        <iframe
          key={song.id}
          src={src}
          title={song.title}
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ width: '100%', height: '100%', display: 'block', border: 'none' }}
        />
      </div>

      <div className="song-card__info">
        <div className="song-card__text">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
          <div className="song-card__meta">
            <span className="tier-badge">Tier {song.tier}</span>
            <span className="comp-badge">{song.comparisons} matchups</span>
            <a
              className="yt-link"
              href={`https://music.youtube.com/watch?v=${song.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              ↗ YT Music
            </a>
          </div>
        </div>
      </div>

      <button className="vote-btn" onClick={e => { e.stopPropagation(); onVote() }}>
        Choose This Song
      </button>
    </div>
  )
}

export default function SongCard(props) {
  return (
    <ErrorBoundary song={props.song} onVote={props.onVote}>
      <SongCardInner {...props} />
    </ErrorBoundary>
  )
}
