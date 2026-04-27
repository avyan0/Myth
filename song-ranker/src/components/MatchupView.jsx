import { useState, useEffect, useCallback, useRef } from 'react'
import SongCard from './SongCard.jsx'
import TierHistogram from './TierHistogram.jsx'
import RankingsView from './RankingsView.jsx'
import { getNextMatch, isComplete, getActiveTierCount } from '../utils/matchmaking.js'

export default function MatchupView({ songs, onVote, onReset, totalComparisons }) {
  const [match, setMatch] = useState(null)
  const [activePlayer, setActivePlayer] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [showRankings, setShowRankings] = useState(false)
  const votedRef = useRef(false)

  const advance = useCallback(() => {
    const next = getNextMatch(songs)
    setMatch(next)
    setActivePlayer(null)
    votedRef.current = false
  }, [songs])

  useEffect(() => {
    advance()
  }, [songs])

  const handleVote = (winnerId, loserId) => {
    if (votedRef.current) return
    votedRef.current = true
    setActivePlayer(null)
    setTimeout(() => {
      onVote(winnerId, loserId)
    }, 300)
  }

  const done = isComplete(songs)
  const activeTiers = getActiveTierCount(songs)
  const songCount = Object.keys(songs).length

  if (done) {
    return (
      <div className="center-view">
        <div className="auth-card">
          <div className="auth-icon">🏆</div>
          <h1>Ranking Complete!</h1>
          <p className="subtitle">
            All {songCount} songs have unique tiers after {totalComparisons} comparisons.
          </p>
          <button className="btn-danger" onClick={() => setShowReset(true)}>
            Reset Everything
          </button>
          {showReset && (
            <div className="confirm-box">
              <p>This will erase all rankings. Are you sure?</p>
              <div className="confirm-buttons">
                <button className="btn-danger" onClick={onReset}>Yes, Reset</button>
                <button className="btn-secondary" onClick={() => setShowReset(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="center-view">
        <div className="auth-card">
          <p>No eligible matchups found. All tiers have only 1 song — ranking is complete!</p>
        </div>
      </div>
    )
  }

  const [songA, songB] = match

  return (
    <div className="matchup-layout">
      <header className="matchup-header">
        <h1 className="app-title">Song Ranker</h1>
        <div className="header-stats">
          <span>{totalComparisons} comparisons</span>
          <span className="sep">·</span>
          <span>{activeTiers} active tier{activeTiers !== 1 ? 's' : ''}</span>
          <span className="sep">·</span>
          <span>{songCount} songs</span>
        </div>
        <button className="btn-ghost" onClick={() => setShowRankings(true)}>Rankings</button>
        <button className="btn-ghost" onClick={() => setShowReset(true)}>Reset</button>
      </header>

      {showRankings && <RankingsView songs={songs} onClose={() => setShowRankings(false)} />}

      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reset All Rankings?</h2>
            <p>This will erase all tiers, votes, and match history.</p>
            <div className="confirm-buttons">
              <button className="btn-danger" onClick={onReset}>Yes, Reset</button>
              <button className="btn-secondary" onClick={() => setShowReset(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <p className="matchup-prompt">Which song is better?</p>
      <p className="matchup-tier-label">Both songs are in <strong>Tier {songA.tier}</strong></p>

      <div className="cards-row">
        <SongCard
          key={songA.id}
          song={songA}
          onVote={() => handleVote(songA.id, songB.id)}
          isPlaying={activePlayer === songA.id}
          onPlay={() => setActivePlayer(songA.id)}
        />
        <div className="vs-divider">VS</div>
        <SongCard
          key={songB.id}
          song={songB}
          onVote={() => handleVote(songB.id, songA.id)}
          isPlaying={activePlayer === songB.id}
          onPlay={() => setActivePlayer(songB.id)}
        />
      </div>

      <TierHistogram songs={songs} />
    </div>
  )
}
