import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Character } from './Character'
import { GrassField } from './GrassField'
import { Sky } from './Sky'
import * as THREE from 'three'
import { useCallback, useState } from 'react'

const CAMERA_POSITION = new THREE.Vector3(-0.018, 1.334, 0.92)
const CAMERA_TARGET = new THREE.Vector3(0, 1.3, 0)
const CAMERA_POSITION_MOBILE = new THREE.Vector3(0, 1, 2)
const CAMERA_TARGET_MOBILE = new THREE.Vector3(0, 1.5, 0)

function CameraLock() {
  const { camera, size } = useThree()
  const isMobile = size.width < 640
  useFrame(() => {
    camera.position.copy(isMobile ? CAMERA_POSITION_MOBILE : CAMERA_POSITION)
    camera.lookAt(isMobile ? CAMERA_TARGET_MOBILE : CAMERA_TARGET)
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
        shadows
      >
        <Sky />
        <GrassField />
        <hemisphereLight
          color="#ffffff"
          groundColor="#8a7a55"
          position={[0, 0, 10]}
          intensity={1}
        />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          color="#ffe0a0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
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
