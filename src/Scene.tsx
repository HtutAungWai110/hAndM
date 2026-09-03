import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Character } from './Character'
import { Sky } from './Sky'
import * as THREE from 'three'
import { useCallback, useState } from 'react'

const CAMERA_POSITION = new THREE.Vector3(-0.062, 1.233, 0.92)
const CAMERA_TARGET = new THREE.Vector3(0, 1.3, 0)
const CAMERA_POSITION_MOBILE = new THREE.Vector3(-0.062, 1.45, 2.4)

function CameraLock() {
  const { camera, size } = useThree()
  const isMobile = size.width < 640
  useFrame(() => {
    camera.position.copy(isMobile ? CAMERA_POSITION_MOBILE : CAMERA_POSITION)
    camera.lookAt(CAMERA_TARGET)
  })
  return null
}

export function Scene() {
  const [isKissing, setIsKissing] = useState(false)
  const handleKissEnd = useCallback(() => setIsKissing(false), [])
  const isMobile = window.innerWidth < 640
  const initialCamera = isMobile ? CAMERA_POSITION_MOBILE : CAMERA_POSITION

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: initialCamera, fov: 50 }}
      >
        <Sky />
        <hemisphereLight
          color="#ffffff"
          groundColor="#8a7a55"
          intensity={0.5}
        />
        <directionalLight
          position={[-4, 6, -3]}
          intensity={1}
          color="#fff4e0"
          castShadow
        />
        <Character isKissing={isKissing} onKissEnd={handleKissEnd} />
        <CameraLock />
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
