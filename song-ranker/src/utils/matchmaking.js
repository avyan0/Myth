export function getNextMatch(songs) {
  const arr = Object.values(songs)
  if (arr.length < 2) return null

  // Group by tier
  const byTier = {}
  for (const song of arr) {
    if (!byTier[song.tier]) byTier[song.tier] = []
    byTier[song.tier].push(song)
  }

  // Only tiers with 2+ songs are eligible
  const activeTiers = Object.values(byTier).filter(g => g.length >= 2)
  if (activeTiers.length === 0) return null

  // Pick the tier containing the song with the fewest total comparisons
  let bestGroup = null
  let minComp = Infinity
  for (const group of activeTiers) {
    const min = Math.min(...group.map(s => s.comparisons))
    if (min < minComp) {
      minComp = min
      bestGroup = group
    }
  }

  // From that tier, sort by comparisons and pick the two least-compared songs
  // Add a small shuffle among equals for variety
  const sorted = [...bestGroup].sort((a, b) => {
    const diff = a.comparisons - b.comparisons
    return diff !== 0 ? diff : Math.random() - 0.5
  })

  return [sorted[0], sorted[1]]
}

export function isComplete(songs) {
  const arr = Object.values(songs)
  if (arr.length === 0) return false
  const byTier = {}
  for (const s of arr) {
    if (!byTier[s.tier]) byTier[s.tier] = 0
    byTier[s.tier]++
  }
  return Object.values(byTier).every(count => count === 1)
}

export function getActiveTierCount(songs) {
  const byTier = {}
  for (const s of Object.values(songs)) {
    if (!byTier[s.tier]) byTier[s.tier] = 0
    byTier[s.tier]++
  }
  return Object.values(byTier).filter(c => c >= 2).length
}

export function getTierDistribution(songs) {
  const byTier = {}
  for (const s of Object.values(songs)) {
    if (!byTier[s.tier]) byTier[s.tier] = []
    byTier[s.tier].push(s)
  }
  return byTier
}
