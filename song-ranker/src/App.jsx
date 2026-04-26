import { useReducer, useEffect } from 'react'
import AuthView from './components/AuthView.jsx'
import PlaylistSetup from './components/PlaylistSetup.jsx'
import MatchupView from './components/MatchupView.jsx'
import { loadState, saveState, clearState } from './utils/storage.js'

const initialState = {
  accessToken: null,
  clientId: null,
  songs: {},        // { [videoId]: SongData }
  playlistId: null,
  history: [],      // [{ winnerId, loserId, timestamp }]
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, accessToken: action.token, clientId: action.clientId }

    case 'SET_SONGS': {
      // Merge with existing songs to preserve tier data on re-load
      const merged = { ...state.songs }
      for (const song of action.songs) {
        if (!merged[song.id]) merged[song.id] = song
      }
      return { ...state, songs: merged, playlistId: action.playlistId }
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

  // Restore persisted state on mount
  useEffect(() => {
    const saved = loadState()
    if (saved) dispatch({ type: 'RESTORE', state: saved })
  }, [])

  // Auto-save after every state change (except the very first empty state)
  useEffect(() => {
    if (state.playlistId) saveState(state)
  }, [state])

  const hasSongs = Object.keys(state.songs).length > 0

  // View routing
  if (!state.accessToken) {
    return (
      <AuthView
        onAuth={(token, clientId) => dispatch({ type: 'SET_AUTH', token, clientId })}
      />
    )
  }

  if (!hasSongs) {
    return (
      <PlaylistSetup
        accessToken={state.accessToken}
        onSongsLoaded={(songs, playlistId) =>
          dispatch({ type: 'SET_SONGS', songs, playlistId })
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
