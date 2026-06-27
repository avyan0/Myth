import { useState, useEffect } from 'react'
import PlaylistSetup from './components/PlaylistSetup.jsx'
import SortView from './components/SortView.jsx'
import { loadState, saveState, clearState } from './utils/storage.js'
import { initSort } from './utils/mergesort.js'

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
          setData({
            songsById,
            playlistId,
            sort: initSort(songs.map(s => s.id)),
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
