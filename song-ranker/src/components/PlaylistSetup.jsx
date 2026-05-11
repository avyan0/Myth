import { useState } from 'react'
import { extractPlaylistId, fetchAllPlaylistItems, filterAvailableSongs } from '../utils/youtube.js'

const ENV_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''

export default function PlaylistSetup({ onSongsLoaded }) {
  const [apiKey, setApiKey] = useState(ENV_API_KEY)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleLoad = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a YouTube Data API key.')
      return
    }
    const id = extractPlaylistId(url)
    if (!id) {
      setError('Could not find a playlist ID. Paste a full YouTube playlist URL or a raw playlist ID.')
      return
    }
    setError('')
    setLoading(true)
    setProgress('Fetching playlist…')
    try {
      const raw = await fetchAllPlaylistItems(id, apiKey.trim())
      if (raw.length === 0) {
        setError('Playlist appears to be empty or all videos are private/deleted.')
        setLoading(false)
        return
      }
      setProgress(`Checking ${raw.length} videos for availability…`)
      const songs = await filterAvailableSongs(raw, apiKey.trim())
      const removed = raw.length - songs.length
      if (songs.length === 0) {
        setError('No playable videos found in this playlist.')
        setLoading(false)
        return
      }
      setProgress(`Ready — ${songs.length} songs loaded${removed > 0 ? ` (${removed} unavailable removed)` : ''}.`)
      onSongsLoaded(songs, id, apiKey.trim())
    } catch (e) {
      setError(e.message || 'Failed to fetch playlist.')
      setLoading(false)
    }
  }

  return (
    <div className="center-view">
      <div className="auth-card">
        <div className="auth-icon">♪</div>
        <h1>Song Ranker</h1>
        <p className="subtitle">Rank your playlist one matchup at a time</p>

        {!ENV_API_KEY && (
          <div className="field-group">
            <label>YouTube Data API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="text-input"
              disabled={loading}
            />
            <p className="hint">
              Get a free key at{' '}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
                Google Cloud Console
              </a>
              {' '}— enable <strong>YouTube Data API v3</strong>, create an API key, restrict it to that API.
            </p>
          </div>
        )}

        <div className="field-group">
          <label>Playlist URL</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="https://www.youtube.com/playlist?list=PL…"
            className="text-input"
            disabled={loading}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}
        {loading && <p className="progress-msg">{progress}</p>}

        <button className="btn-primary" onClick={handleLoad} disabled={loading}>
          {loading ? 'Loading…' : 'Load Songs'}
        </button>
      </div>
    </div>
  )
}
