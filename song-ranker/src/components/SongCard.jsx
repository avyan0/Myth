import { useRef, useEffect, useState } from 'react'
import { loadYTApi, onYTReady } from '../utils/ytApi.js'

// Piped instances to try as fallback (in order)
const PIPED = 'https://piped.video'

export default function SongCard({ song, onVote, isPlaying, onPlay }) {
  const ytContainerRef = useRef(null)
  const playerRef = useRef(null)
  const [mode, setMode] = useState('yt')   // 'yt' | 'piped' | 'dead'
  const [localPlaying, setLocalPlaying] = useState(false)
  const pipedRef = useRef(null)

  // ── Build & destroy the YT IFrame API player ──────────────────────────
  useEffect(() => {
    if (mode !== 'yt') return
    let mounted = true
    loadYTApi()

    onYTReady(() => {
      if (!mounted || !ytContainerRef.current) return
      playerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: song.id,
        width: '100%',
        height: '200',          // full height; we'll offset it via CSS trick
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady(e) {
            if (!mounted) return
            // Shift iframe up so only the controls bar (~40 px) is visible
            e.target.getIframe().style.cssText +=
              ';margin-top:-160px;display:block;'
          },
          onError(e) {
            if (!mounted) return
            // 101 / 150 = embedding disabled; 100 = not found; 5 = HTML5 error
            if ([100, 101, 150, 5].includes(e.data)) {
              setMode('piped')
            } else {
              setMode('dead')
            }
          },
        },
      })
    })

    return () => {
      mounted = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [song.id, mode])

  // ── Pause this card when the other starts ─────────────────────────────
  useEffect(() => {
    if (!isPlaying && localPlaying) {
      pause()
      setLocalPlaying(false)
    }
  }, [isPlaying])

  // ── Reset play state on song change ──────────────────────────────────
  useEffect(() => {
    setLocalPlaying(false)
    setMode('yt')
  }, [song.id])

  function pause() {
    if (mode === 'yt') playerRef.current?.pauseVideo?.()
    // Piped doesn't have a reliable postMessage API; just mute via iframe src reset isn't great,
    // so we rely on the user pausing manually (or the next song auto-starting)
  }

  const handlePlayPause = e => {
    e.stopPropagation()
    if (mode === 'dead') return
    if (localPlaying) {
      pause()
      setLocalPlaying(false)
    } else {
      if (mode === 'yt') playerRef.current?.playVideo?.()
      // Piped: user presses play inside its own controls
      setLocalPlaying(true)
      onPlay()
    }
  }

  const pipedSrc = `${PIPED}/embed/${song.id}?autoplay=0`

  return (
    <div className={`song-card ${localPlaying ? 'song-card--playing' : ''}`} onClick={onVote}>

      {/* ── Album art + play overlay ── */}
      <div className="song-card__art">
        {song.thumbnail
          ? <img src={song.thumbnail} alt={song.title} />
          : <div className="song-card__art-placeholder">♪</div>}

        {mode !== 'dead' && (
          <button
            className={`play-overlay ${localPlaying ? 'play-overlay--active' : ''}`}
            onClick={handlePlayPause}
          >
            {localPlaying ? '⏸' : '▶'}
          </button>
        )}

        {mode === 'dead' && (
          <a
            className="play-overlay play-overlay--dead"
            href={`https://www.youtube.com/watch?v=${song.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            ↗ Open on YouTube
          </a>
        )}
      </div>

      {/* ── Audio strip ── */}
      <div className="song-card__audio" onClick={e => e.stopPropagation()}>
        {mode === 'yt' && (
          /* ytContainerRef div gets replaced by the YT IFrame API with an <iframe>.
             The outer container clips to 40 px; the iframe is offset -160 px via onReady. */
          <div ref={ytContainerRef} />
        )}

        {mode === 'piped' && (
          <iframe
            ref={pipedRef}
            key={`piped-${song.id}`}
            src={pipedSrc}
            title={song.title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            style={{ width: '100%', height: '200px', marginTop: '-160px', display: 'block', border: 'none' }}
          />
        )}

        {mode === 'dead' && (
          <div className="audio-dead">Playback unavailable</div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="song-card__info">
        <div className="song-card__text">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
          <div className="song-card__meta">
            <span className="tier-badge">Tier {song.tier}</span>
            <span className="comp-badge">{song.comparisons} matchups</span>
            {mode === 'piped' && <span className="fallback-badge">via Piped</span>}
          </div>
        </div>
      </div>

      <button className="vote-btn" onClick={e => { e.stopPropagation(); onVote() }}>
        Choose This Song
      </button>
    </div>
  )
}
