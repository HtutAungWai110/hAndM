import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Scene } from './Scene'
import { getSnapshot, subscribe } from './loader'

function LoadingScreen() {
  const { loaded, total } = useSyncExternalStore(subscribe, getSnapshot)
  const [visible, setVisible] = useState(false)
  const doneRef = useRef(false)

  const progress = total === 0 ? 0 : Math.min(100, Math.round((loaded / total) * 100))

  useEffect(() => {
    if (doneRef.current) return
    if (total > 0) setVisible(true)
  }, [total])

  useEffect(() => {
    if (doneRef.current) return
    if (total > 0 && loaded >= total) {
      const t = setTimeout(() => {
        doneRef.current = true
        setVisible(false)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [loaded, total])

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
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease',
        fontFamily: 'sans-serif',
      }}
    >
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
    </div>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Scene />
      <LoadingScreen />
    </div>
  )
}

export default App