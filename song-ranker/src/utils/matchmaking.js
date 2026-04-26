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
  const activeTiers = Object.entries(byTier)
    .filter(([, g]) => g.length >= 2)
    .map(([tier, g]) => ({ tier: Number(tier), group: g }))
  if (activeTiers.length === 0) return null

  // Priority: 0, +1, -1, +2, -2, +3, -3, …
  // tier >= 0 → priority = tier * 2; tier < 0 → priority = tier * -2 - 1
  const priority = t => t >= 0 ? t * 2 : t * -2 - 1
  activeTiers.sort((a, b) => priority(a.tier) - priority(b.tier))
  const bestGroup = activeTiers[0].group

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
