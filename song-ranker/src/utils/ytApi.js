// Singleton loader for the YouTube IFrame API
let apiReady = false
const queue = []

export function loadYTApi() {
  // Already loaded or loading
  if (window.YT?.Player || document.querySelector('script[src*="iframe_api"]')) {
    if (window.YT?.Player) apiReady = true
    return
  }
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true
    queue.forEach(cb => cb())
    queue.length = 0
  }
  const s = document.createElement('script')
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
}

export function onYTReady(cb) {
  if (apiReady || window.YT?.Player) cb()
  else queue.push(cb)
}
