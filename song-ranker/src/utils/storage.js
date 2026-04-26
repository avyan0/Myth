const KEY = 'song_ranker_v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function clearState() {
  localStorage.removeItem(KEY)
}
