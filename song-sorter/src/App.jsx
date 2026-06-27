import { useState, useEffect } from 'react'
import PlaylistSetup from './components/PlaylistSetup.jsx'
import SortView from './components/SortView.jsx'
import { loadState, saveState, clearState } from './utils/storage.js'
import { initSort } from './utils/mergesort.js'

// Fisher-Yates shuffle (returns a new array)
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  // songsById: { [id]: songData }, sort: serialized merge-sort state
  const [data, setData] = useState(null)
  const [restored, setRestored] = useState(false)

  // Restore on mount
  useEffect(() => {
    const saved = loadState()
    if (saved?.songsById && saved?.sort) setData(saved)
    setRestored(true)
  }, [])

  // Auto-save
  useEffect(() => {
    if (data) saveState(data)
  }, [data])

  if (!restored) return null

  if (!data) {
    return (
      <PlaylistSetup
        onSongsLoaded={(songs, playlistId) => {
          const songsById = {}
          for (const s of songs) songsById[s.id] = s
          // Shuffle so matchups don't follow playlist order
          const ids = shuffle(songs.map(s => s.id))
          setData({
            songsById,
            playlistId,
            sort: initSort(ids),
          })
        }}
      />
    )
  }

  return (
    <SortView
      songsById={data.songsById}
      sort={data.sort}
      onSortChange={nextSort => setData(d => ({ ...d, sort: nextSort }))}
      onReset={() => {
        clearState()
        setData(null)
      }}
    />
  )
}
