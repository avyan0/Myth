import { useState, useRef } from 'react'
import SongCard from './SongCard.jsx'
import ResultsView from './ResultsView.jsx'
import { getComparison, applyChoice, progress, remainingEstimate } from '../utils/mergesort.js'

export default function SortView({ songsById, sort, onSortChange, onReset }) {
  const [showReset, setShowReset] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const votedRef = useRef(false)

  // getComparison may pop runs to start a merge — work on a structuredClone so
  // we don't mutate the saved state until a choice is actually made.
  const working = structuredClone(sort)
  const pair = getComparison(working)

  // If getComparison advanced state (started a merge or finished), persist it.
  if (JSON.stringify(working) !== JSON.stringify(sort)) {
    // Defer to avoid setState-during-render warning
    queueMicrotask(() => onSortChange(working))
  }

  const handleVote = winnerId => {
    if (votedRef.current) return
    votedRef.current = true
    setTimeout(() => {
      const next = applyChoice(working, winnerId)
      onSortChange(next)
      votedRef.current = false
    }, 250)
  }

  const pct = Math.round(progress(working) * 100)
  const done = !!working.sorted

  if (done) {
    return (
      <ResultsView
        songsById={songsById}
        order={working.sorted}
        comparisons={working.comparisons}
        onReset={onReset}
      />
    )
  }

  if (!pair) {
    return (
      <div className="center-view">
        <div className="auth-card"><p>Preparing matchups…</p></div>
      </div>
    )
  }

  const [idA, idB] = pair
  const songA = songsById[idA]
  const songB = songsById[idB]

  return (
    <div className="matchup-layout">
      <header className="matchup-header">
        <h1 className="app-title">Song Sorter</h1>
        <div className="header-stats">
          <span>{working.comparisons} comparisons</span>
          <span className="sep">·</span>
          <span>~{remainingEstimate(working)} left</span>
        </div>
        <button className="btn-ghost" onClick={() => setShowResults(true)}>Standings</button>
        <button className="btn-ghost" onClick={() => setShowReset(true)}>Reset</button>
      </header>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <span className="progress-label">{pct}% sorted</span>
      </div>

      {showResults && (
        <ResultsView
          songsById={songsById}
          order={partialOrder(working)}
          comparisons={working.comparisons}
          partial
          onClose={() => setShowResults(false)}
        />
      )}

      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reset Sort?</h2>
            <p>This erases all progress and the current ranking.</p>
            <div className="confirm-buttons">
              <button className="btn-danger" onClick={onReset}>Yes, Reset</button>
              <button className="btn-secondary" onClick={() => setShowReset(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <p className="matchup-prompt">Which song is better?</p>
      <p className="matchup-tier-label">Your pick is locked in — choose carefully</p>

      <div className="cards-row">
        <SongCard key={idA} song={songA} onVote={() => handleVote(idA)} />
        <div className="vs-divider">VS</div>
        <SongCard key={idB} song={songB} onVote={() => handleVote(idB)} />
      </div>
    </div>
  )
}

// Best-effort partial standings: the longest run currently in the queue is the
// most-merged (closest to fully sorted) chunk so far.
function partialOrder(state) {
  let longest = state.merge ? state.merge.out : []
  for (const run of state.queue) {
    if (run.length > longest.length) longest = run
  }
  return longest
}
