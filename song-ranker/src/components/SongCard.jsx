import { useRef, useEffect, useState } from 'react'

export default function SongCard({ song, onVote, isPlaying, onPlay }) {
  const iframeRef = useRef(null)
  const [localPlaying, setLocalPlaying] = useState(false)

  // When another card starts playing, pause this one
  useEffect(() => {
    if (!isPlaying && localPlaying) {
      sendCommand('pauseVideo')
      setLocalPlaying(false)
    }
  }, [isPlaying])

  function sendCommand(func, args) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: args || [] }),
      '*',
    )
  }

  const handlePlayPause = e => {
    e.stopPropagation()
    if (localPlaying) {
      sendCommand('pauseVideo')
      setLocalPlaying(false)
    } else {
      sendCommand('playVideo')
      setLocalPlaying(true)
      onPlay()
    }
  }

  // Reset local play state when song changes
  useEffect(() => {
    setLocalPlaying(false)
  }, [song.id])

  const embedSrc = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&controls=1&modestbranding=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`

  return (
    <div className={`song-card ${isPlaying && localPlaying ? 'song-card--playing' : ''}`} onClick={onVote}>
      <div className="song-card__player" onClick={e => e.stopPropagation()}>
        <iframe
          key={song.id}
          ref={iframeRef}
          src={embedSrc}
          title={song.title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      <div className="song-card__info">
        {song.thumbnail && (
          <img src={song.thumbnail} alt="" className="song-card__thumb" />
        )}
        <div className="song-card__text">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
          <div className="song-card__meta">
            <span className="tier-badge">Tier {song.tier}</span>
            <span className="comp-badge">{song.comparisons} matchups</span>
          </div>
        </div>
      </div>

      <button className={`play-btn ${localPlaying ? 'play-btn--active' : ''}`} onClick={handlePlayPause}>
        {localPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      <button className="vote-btn" onClick={onVote}>
        Choose This Song
      </button>
    </div>
  )
}
