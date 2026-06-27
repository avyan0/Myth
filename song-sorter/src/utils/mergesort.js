// Interactive, resumable bottom-up merge sort.
//
// State is fully serializable (only arrays of song ids + counters), so the
// whole sort can be saved to localStorage and resumed mid-merge.
//
// Sorting is best→worst: the "winner" of each comparison is placed first.

export function initSort(songIds) {
  // Each song starts as its own sorted run of length 1.
  const queue = songIds.map(id => [id])
  return {
    queue,                 // FIFO list of sorted runs waiting to be merged
    merge: null,           // active merge: { a, b, out } or null
    comparisons: 0,        // user choices made
    placements: 0,         // elements committed to output (for progress)
    totalPlacements: estimateTotalPlacements(songIds.length),
    sorted: songIds.length <= 1 ? songIds.slice() : null,
  }
}

// Bottom-up FIFO merge does ceil(log2 n) passes, each placing n elements.
function estimateTotalPlacements(n) {
  if (n <= 1) return 0
  return n * Math.ceil(Math.log2(n))
}

// Returns [idA, idB] for the next comparison, or null if sorting is done.
// Mutates state only to *start* a merge (popping two runs); never destructive
// beyond that, and the result is re-derivable, so it's safe to call freely.
export function getComparison(state) {
  if (state.sorted) return null

  if (!state.merge) {
    if (state.queue.length >= 2) {
      const a = state.queue.shift()
      const b = state.queue.shift()
      state.merge = { a, b, out: [] }
    } else if (state.queue.length === 1) {
      state.sorted = state.queue[0]
      return null
    } else {
      state.sorted = []
      return null
    }
  }

  return [state.merge.a[0], state.merge.b[0]]
}

// Apply the user's choice. winnerId must be the front of merge.a or merge.b.
// Returns a new state object (immutable-friendly for React).
export function applyChoice(state, winnerId) {
  const s = cloneState(state)
  if (!s.merge) return s

  const { a, b, out } = s.merge
  if (a[0] === winnerId) out.push(a.shift())
  else if (b[0] === winnerId) out.push(b.shift())
  else return s // ignore stray clicks

  s.comparisons++
  s.placements++

  // If either run is exhausted, drain the other and finish this merge.
  if (a.length === 0 || b.length === 0) {
    const rest = a.length === 0 ? b : a
    s.placements += rest.length
    s.merge.out = out.concat(rest)
    s.queue.push(s.merge.out)
    s.merge = null

    // Sort complete when one run remains and nothing is mid-merge.
    if (s.queue.length === 1) s.sorted = s.queue[0]
  }

  return s
}

export function progress(state) {
  if (state.totalPlacements === 0) return 1
  return Math.min(1, state.placements / state.totalPlacements)
}

export function remainingEstimate(state) {
  // Comparisons are slightly fewer than placements (drains are free), but
  // placements is the honest monotonic measure of work left.
  return Math.max(0, state.totalPlacements - state.placements)
}

function cloneState(state) {
  return {
    queue: state.queue.map(run => run.slice()),
    merge: state.merge
      ? { a: state.merge.a.slice(), b: state.merge.b.slice(), out: state.merge.out.slice() }
      : null,
    comparisons: state.comparisons,
    placements: state.placements,
    totalPlacements: state.totalPlacements,
    sorted: state.sorted ? state.sorted.slice() : null,
  }
}
