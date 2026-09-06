import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
    console.error('[ErrorBoundary stack]', error.stack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1f1f1f',
            color: '#fff',
            fontFamily: 'sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Failed to load 3D scene
            </div>
            <div style={{ fontSize: 13, color: '#aaa', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
              {this.state.error?.message ?? 'An unknown error occurred.'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                location.reload()
              }}
              style={{
                marginTop: 20,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#e91e63',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
