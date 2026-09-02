import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Character } from './Character'
import * as THREE from 'three'
import { useCallback, useState } from 'react'

const CAMERA_POSITION = new THREE.Vector3(-0.062, 1.233, 0.92)
const CAMERA_TARGET = new THREE.Vector3(0, 1.3, 0)

function CameraLogger() {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.copy(CAMERA_POSITION)
    camera.lookAt(CAMERA_TARGET)
    const pos = camera.position
    const rot = camera.rotation
    const fov = (camera as THREE.PerspectiveCamera).fov
    console.log(
      `CAMERA [${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}] ` +
      `rot=[${rot.x.toFixed(3)}, ${rot.y.toFixed(3)}, ${rot.z.toFixed(3)}] fov=${fov.toFixed(2)}`
    )
  })
  return null
}

export function Scene() {
  const [isKissing, setIsKissing] = useState(false)
  const handleKissEnd = useCallback(() => setIsKissing(false), [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: 50 }}
        scene={{ background: new THREE.Color('#505050') }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Grid
          cellSize={1}
          cellThickness={1}
          cellColor="#666666"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#9b9b9b"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid
        />
        <Character isKissing={isKissing} onKissEnd={handleKissEnd} />
        <OrbitControls />
        <CameraLogger />
      </Canvas>
      <button
        onClick={() => setIsKissing(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#e91e63',
          color: '#fff',
          fontSize: 17,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        Kiss
      </button>
    </div>
  )
}
