import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { crashed: false }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  componentDidCatch(err) {
    console.error('SongCard crashed:', err)
  }

  render() {
    if (this.state.crashed) {
      const { song } = this.props
      return (
        <div className="song-card song-card--error">
          <div className="player-dead">
            <span>Couldn't load player</span>
            {song && (
              <a
                href={`https://music.youtube.com/watch?v=${song.id}`}
                target="_blank"
                rel="noreferrer"
              >
                ↗ Open in YouTube Music
              </a>
            )}
          </div>
          <div className="song-card__info">
            <div className="song-card__text">
              <p className="song-card__title">{song?.title}</p>
              <p className="song-card__artist">{song?.artist}</p>
            </div>
          </div>
          {this.props.onVote && (
            <button className="vote-btn" onClick={this.props.onVote}>
              Choose This Song
            </button>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
