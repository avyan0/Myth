import { useRef, useEffect, useState } from 'react'

export default function SongCard({ song, onVote, isPlaying, onPlay }) {
  const iframeRef = useRef(null)
  const [localPlaying, setLocalPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying && localPlaying) {
      sendCommand('pauseVideo')
      setLocalPlaying(false)
    }
  }, [isPlaying])

  useEffect(() => {
    setLocalPlaying(false)
  }, [song.id])

  function sendCommand(func) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
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

  // Audio-only embed: no video track shown, just the controls bar
  const embedSrc =
    `https://www.youtube.com/embed/${song.id}` +
    `?enablejsapi=1&controls=1&modestbranding=1&rel=0` +
    `&fs=0&iv_load_policy=3` +
    `&origin=${encodeURIComponent(window.location.origin)}`

  return (
    <div className={`song-card ${localPlaying ? 'song-card--playing' : ''}`} onClick={onVote}>

      {/* Thumbnail as main visual */}
      <div className="song-card__art">
        {song.thumbnail
          ? <img src={song.thumbnail} alt={song.title} />
          : <div className="song-card__art-placeholder">♪</div>
        }
        <button className={`play-overlay ${localPlaying ? 'play-overlay--active' : ''}`} onClick={handlePlayPause}>
          {localPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Audio-only iframe — just the controls bar, video is off-screen */}
      <div className="song-card__audio" onClick={e => e.stopPropagation()}>
        <iframe
          key={song.id}
          ref={iframeRef}
          src={embedSrc}
          title={song.title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>

      <div className="song-card__info">
        <div className="song-card__text">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
          <div className="song-card__meta">
            <span className="tier-badge">Tier {song.tier}</span>
            <span className="comp-badge">{song.comparisons} matchups</span>
          </div>
        </div>
      </div>

      <button className="vote-btn" onClick={e => { e.stopPropagation(); onVote() }}>
        Choose This Song
      </button>
    </div>
  )
}
