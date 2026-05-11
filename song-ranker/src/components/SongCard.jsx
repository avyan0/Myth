import { useRef, useEffect, useState } from 'react'
import { loadYTApi, onYTReady } from '../utils/ytApi.js'

const PIPED = 'https://piped.video'

export default function SongCard({ song, onVote, isPlaying, onPlay }) {
  const ytContainerRef = useRef(null)
  const playerRef = useRef(null)
  const mountedRef = useRef(true)
  const [mode, setMode] = useState('yt')   // 'yt' | 'piped' | 'dead'
  const [localPlaying, setLocalPlaying] = useState(false)

  // ── Build / destroy YT player ─────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'yt') return
    mountedRef.current = true
    loadYTApi()

    onYTReady(() => {
      if (!mountedRef.current || !ytContainerRef.current) return
      try {
        playerRef.current = new window.YT.Player(ytContainerRef.current, {
          videoId: song.id,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
          },
          events: {
            onStateChange(e) {
              if (!mountedRef.current) return
              if (e.data === window.YT.PlayerState.PLAYING) {
                setLocalPlaying(true)
                onPlay()
              } else if (
                e.data === window.YT.PlayerState.PAUSED ||
                e.data === window.YT.PlayerState.ENDED
              ) {
                setLocalPlaying(false)
              }
            },
            onError(e) {
              if (!mountedRef.current) return
              // 100: not found, 101/150: embed blocked, 2/5: bad request / HTML5 error
              if ([100, 101, 150].includes(e.data)) {
                setMode('piped')
              } else {
                setMode('dead')
              }
            },
          },
        })
      } catch (err) {
        console.error('YT.Player init error:', err)
        if (mountedRef.current) setMode('dead')
      }
    })

    return () => {
      mountedRef.current = false
      try { playerRef.current?.destroy() } catch (_) {}
      playerRef.current = null
    }
  }, [song.id, mode])

  // ── Pause when other card plays ───────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && localPlaying) {
      try { playerRef.current?.pauseVideo?.() } catch (_) {}
      setLocalPlaying(false)
    }
  }, [isPlaying])

  // ── Reset on song change ──────────────────────────────────────────────
  useEffect(() => {
    setLocalPlaying(false)
    setMode('yt')
  }, [song.id])

  return (
    <div className={`song-card ${localPlaying ? 'song-card--playing' : ''}`} onClick={onVote}>

      {/* ── Player ── */}
      <div className="song-card__player" onClick={e => e.stopPropagation()}>
        {mode === 'yt' && (
          <div ref={ytContainerRef} style={{ width: '100%', height: '100%' }} />
        )}

        {mode === 'piped' && (
          <iframe
            key={`piped-${song.id}`}
            src={`${PIPED}/embed/${song.id}?autoplay=0`}
            title={song.title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            style={{ width: '100%', height: '100%', display: 'block', border: 'none' }}
          />
        )}

        {mode === 'dead' && (
          <div className="player-dead">
            <span>Playback unavailable</span>
            <a
              href={`https://www.youtube.com/watch?v=${song.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              ↗ Open on YouTube
            </a>
          </div>
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
