import { useState } from 'react'
import { extractPlaylistId, fetchAllPlaylistItems } from '../utils/youtube.js'

export default function PlaylistSetup({ accessToken, onSongsLoaded }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleLoad = async () => {
    const id = extractPlaylistId(url)
    if (!id) {
      setError('Could not find a playlist ID in that URL. Paste a YouTube playlist URL or raw playlist ID.')
      return
    }
    setError('')
    setLoading(true)
    setProgress('Fetching songs…')
    try {
      const songs = await fetchAllPlaylistItems(id, accessToken)
      if (songs.length === 0) {
        setError('Playlist appears to be empty or all videos are private/deleted.')
        setLoading(false)
        return
      }
      setProgress(`Loaded ${songs.length} songs!`)
      onSongsLoaded(songs, id)
    } catch (e) {
      setError(e.message || 'Failed to fetch playlist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-view">
      <div className="auth-card">
        <div className="auth-icon">♪</div>
        <h1>Load Playlist</h1>
        <p className="subtitle">Paste a YouTube or YouTube Music playlist URL</p>

        <div className="field-group">
          <label>Playlist URL or ID</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="https://www.youtube.com/playlist?list=PL..."
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
