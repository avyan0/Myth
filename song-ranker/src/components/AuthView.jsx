import { useState } from 'react'
import { initGoogleAuth } from '../utils/youtube.js'

const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthView({ onAuth }) {
  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!clientId.trim()) {
      setError('Please enter your Google OAuth Client ID.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const token = await initGoogleAuth(clientId.trim(), () => {})
      onAuth(token, clientId.trim())
    } catch (e) {
      setError(e.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-view">
      <div className="auth-card">
        <div className="auth-icon">♪</div>
        <h1>Song Ranker</h1>
        <p className="subtitle">Rank your playlist with 1v1 matchups</p>

        <div className="field-group">
          <label>Google OAuth Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="1234567890-abc...apps.googleusercontent.com"
            className="text-input"
          />
          <p className="hint">
            Create one at{' '}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
              Google Cloud Console
            </a>
            . Enable the YouTube Data API v3 and add your domain as an authorized JS origin.
            Set type to <strong>Web application</strong>.
          </p>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
