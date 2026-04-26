export function extractPlaylistId(input) {
  const trimmed = input.trim()
  // Already a raw ID (no slashes or dots)
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && !trimmed.includes('.')) return trimmed
  try {
    const url = new URL(trimmed)
    return url.searchParams.get('list') || null
  } catch {
    return null
  }
}

export async function fetchAllPlaylistItems(playlistId, accessToken) {
  const songs = []
  let pageToken = ''

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('playlistId', playlistId)
    url.searchParams.set('maxResults', '50')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API error ${res.status}`)
    }

    const data = await res.json()

    for (const item of data.items || []) {
      const videoId = item.snippet?.resourceId?.videoId
      if (!videoId) continue
      // Skip deleted/private videos
      if (item.snippet.title === 'Deleted video' || item.snippet.title === 'Private video') continue

      songs.push({
        id: videoId,
        title: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle?.replace(/ - Topic$/, '') || '',
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          '',
        tier: 0,
        wins: 0,
        losses: 0,
        comparisons: 0,
      })
    }

    pageToken = data.nextPageToken || ''
  } while (pageToken)

  return songs
}

let tokenClient = null

export function initGoogleAuth(clientId, onToken) {
  return new Promise((resolve, reject) => {
    const load = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        callback: response => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }
          onToken(response.access_token)
          resolve(response.access_token)
        },
      })
      tokenClient.requestAccessToken({ prompt: 'consent' })
    }

    if (window.google?.accounts?.oauth2) {
      load()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = load
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      document.head.appendChild(script)
    }
  })
}
