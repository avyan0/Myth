export function extractPlaylistId(input) {
  const trimmed = input.trim()
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && !trimmed.includes('.')) return trimmed
  try {
    const url = new URL(trimmed)
    return url.searchParams.get('list') || null
  } catch {
    return null
  }
}

export async function fetchAllPlaylistItems(playlistId, apiKey) {
  const songs = []
  let pageToken = ''

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('playlistId', playlistId)
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('key', apiKey)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString())

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API error ${res.status}`)
    }

    const data = await res.json()

    for (const item of data.items || []) {
      const videoId = item.snippet?.resourceId?.videoId
      if (!videoId) continue
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
