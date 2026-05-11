// Singleton loader for the YouTube IFrame API
let apiReady = false
const queue = []

export function loadYTApi() {
  if (window.YT?.Player) { apiReady = true; return }
  if (document.querySelector('script[src*="iframe_api"]')) return

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true
    queue.splice(0).forEach(cb => { try { cb() } catch(e) { console.error(e) } })
  }
  const s = document.createElement('script')
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
}

export function onYTReady(cb) {
  if (apiReady || window.YT?.Player) {
    try { cb() } catch(e) { console.error(e) }
  } else {
    queue.push(cb)
  }
}
