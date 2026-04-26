import { useReducer, useEffect } from 'react'
import PlaylistSetup from './components/PlaylistSetup.jsx'
import MatchupView from './components/MatchupView.jsx'
import { loadState, saveState, clearState } from './utils/storage.js'

const initialState = {
  songs: {},
  playlistId: null,
  apiKey: null,
  history: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SONGS': {
      const merged = { ...state.songs }
      for (const song of action.songs) {
        if (!merged[song.id]) merged[song.id] = song
      }
      return { ...state, songs: merged, playlistId: action.playlistId, apiKey: action.apiKey }
    }

    case 'VOTE': {
      const { winnerId, loserId } = action
      const songs = { ...state.songs }
      songs[winnerId] = {
        ...songs[winnerId],
        tier: songs[winnerId].tier + 1,
        wins: songs[winnerId].wins + 1,
        comparisons: songs[winnerId].comparisons + 1,
      }
      songs[loserId] = {
        ...songs[loserId],
        tier: songs[loserId].tier - 1,
        losses: songs[loserId].losses + 1,
        comparisons: songs[loserId].comparisons + 1,
      }
      return {
        ...state,
        songs,
        history: [...state.history, { winnerId, loserId, timestamp: Date.now() }],
      }
    }

    case 'RESET':
      return initialState

    case 'RESTORE':
      return action.state

    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadState()
    if (saved) dispatch({ type: 'RESTORE', state: saved })
  }, [])

  useEffect(() => {
    if (state.playlistId) saveState(state)
  }, [state])

  const hasSongs = Object.keys(state.songs).length > 0

  if (!hasSongs) {
    return (
      <PlaylistSetup
        onSongsLoaded={(songs, playlistId, apiKey) =>
          dispatch({ type: 'SET_SONGS', songs, playlistId, apiKey })
        }
      />
    )
  }

  return (
    <MatchupView
      songs={state.songs}
      totalComparisons={state.history.length}
      onVote={(winnerId, loserId) => dispatch({ type: 'VOTE', winnerId, loserId })}
      onReset={() => {
        clearState()
        dispatch({ type: 'RESET' })
      }}
    />
  )
}
