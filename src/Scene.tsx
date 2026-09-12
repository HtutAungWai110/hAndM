import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Character } from './Character'
import { GrassField } from './GrassField'
import { Sky } from './Sky'
import * as THREE from 'three'
import { useCallback, useState } from 'react'
import { Flower } from 'lucide-react'


const CAMERA_POSITION = new THREE.Vector3(-0.018, 1.334, 0.92)
const CAMERA_TARGET = new THREE.Vector3(0, 1.3, 0)
const CAMERA_POSITION_MOBILE = new THREE.Vector3(0, 1, 2)
const CAMERA_TARGET_MOBILE = new THREE.Vector3(0, 1.5, -1)

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
  const [isGivingFlowers, setIsGivingFlowers] = useState(false)
  const handleKissEnd = useCallback(() => setIsKissing(false), [])
  const handleFlowersEnd = useCallback(() => setIsGivingFlowers(false), [])
  const isMobile = window.innerWidth < 640
  const initialCamera = isMobile ? CAMERA_POSITION_MOBILE : CAMERA_POSITION

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: initialCamera, fov: 50 }}
        shadows
        dpr={[1, 1]}
        gl={{ antialias: true, powerPreference: 'high-performance', precision: isMobile ? 'mediump' : 'highp' }}
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
        <Character isKissing={isKissing} onKissEnd={handleKissEnd} isGivingFlowers={isGivingFlowers} onFlowersEnd={handleFlowersEnd} />
        <CameraLock />
      </Canvas>
      <div className="fixed right-6 bottom-6 flex flex-col gap-3">
        <button
          disabled={isKissing || isGivingFlowers}
          onClick={() => setIsKissing(true)}
          className="relative w-[72px] h-[72px] rounded-full border-none bg-[#e91e63] text-white text-[17px] font-bold cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        >
          Kiss
        </button>
        <button
          disabled={isKissing || isGivingFlowers}
          onClick={() => setIsGivingFlowers(true)}
          className="relative w-[72px] h-[72px] flex items-center justify-center rounded-full border-none bg-[#ff9800] text-white text-[15px] font-bold cursor-pointer whitespace-nowrap px-3 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        >
          <Flower className="w-10 h-10" />
        </button>
      </div>
    </div>
  )
}
