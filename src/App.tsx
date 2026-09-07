import { useSyncExternalStore } from 'react'
import { Scene } from './Scene'
import { getSnapshot, subscribe } from './loader'
import { ErrorBoundary } from './ErrorBoundary'

function LoadingScreen() {
  const { loaded, total, error, done } = useSyncExternalStore(subscribe, getSnapshot)

  const progress = total === 0 ? 0 : Math.min(100, Math.round((loaded / total) * 100))
  const visible = !done && !error && total > 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: '#1f1f1f',
        color: '#fff',
        opacity: error || visible ? 1 : 0,
        pointerEvents: error || visible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease',
        fontFamily: 'sans-serif',
      }}
    >
      {error ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ff5252' }}>
            Loading failed
          </div>
          <div style={{ fontSize: 13, color: '#aaa', maxWidth: 400, textAlign: 'center', lineHeight: 1.5 }}>
            {error}
          </div>
          <button
            onClick={() => location.reload()}
            style={{
              marginTop: 8,
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
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            LOADING
          </div>
          <div
            style={{
              width: 280,
              height: 8,
              borderRadius: 4,
              background: '#3a3a3a',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 4,
                background: '#e91e63',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>{progress}%</div>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Scene />
        <LoadingScreen />
      </div>
    </ErrorBoundary>
  )
}

export default App
