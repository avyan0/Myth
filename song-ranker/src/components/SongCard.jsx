import { useState } from 'react'

const PIPED = 'https://piped.video'

// Plain-iframe card — no YT IFrame API, nothing to crash.
// Piped is primary: it plays all YouTube music without embedding restrictions.
// YouTube is available as a toggle if the user prefers.
function SongCardInner({ song, onVote }) {
  const [useYT, setUseYT] = useState(false)

  const pipedSrc  = `${PIPED}/embed/${song.id}?autoplay=0`
  const ytSrc     = `https://www.youtube.com/embed/${song.id}?controls=1&rel=0&modestbranding=1&fs=0`

  return (
    <div className="song-card" onClick={onVote}>

      <div className="song-card__player" onClick={e => e.stopPropagation()}>
        <iframe
          key={useYT ? `yt-${song.id}` : `p-${song.id}`}
          src={useYT ? ytSrc : pipedSrc}
          title={song.title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
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
            <button
              className="source-toggle"
              onClick={e => { e.stopPropagation(); setUseYT(v => !v) }}
            >
              {useYT ? 'Switch to Piped' : 'Switch to YouTube'}
            </button>
          </div>
        </div>
      </div>

      <button className="vote-btn" onClick={e => { e.stopPropagation(); onVote() }}>
        Choose This Song
      </button>
    </div>
  )
}

// Wrap in an inline error boundary so a broken iframe can never crash the app.
import ErrorBoundary from './ErrorBoundary.jsx'
export default function SongCard(props) {
  return (
    <ErrorBoundary song={props.song} onVote={props.onVote}>
      <SongCardInner {...props} />
    </ErrorBoundary>
  )
}
