import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import hdrUrl from './assets/hdri/hilly_terrain_01_2k.hdr'

// ── SKY CONTROLS (edit these numbers, save, and the sky updates) ───────────────
// The HDRI is painted on the inside of a giant sphere (the "sky dome"). The camera
// sits inside it, so increasing SPHERE_RADIUS makes the sky larger/further away.
const SPHERE_RADIUS = 500 // sky dome sphere size
const SPHERE_POSITION: [number, number, number] = [0, 50, 0] // [x, y, z] dome location
const SPHERE_ROTATION: [number, number, number] = [0, 0, 0] // [x, y, z] dome rotation (radians)
const USE_BACKGROUND_MODE = false // true = use scene.background (infinite; radius/position ignored, rotation still works)
const ENVIRONMENT_INTENSITY = 0 // how strongly the HDRI lights the models: 0 = off, 1 = full reflections
// ───────────────────────────────────────────────────────────────────────────────

export function Sky() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const texture = useLoader(RGBELoader, hdrUrl)

  const envMap = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromEquirectangular(texture)
    pmrem.dispose()
    return rt.texture
  }, [gl, texture])

  // Equirectangular copy for the dome mesh (kept in linear HDR; tone mapping handles display).
  const domeTexture = useMemo(() => texture.clone(), [texture])

  useEffect(() => {
    scene.background = USE_BACKGROUND_MODE ? envMap : null
    scene.environment = envMap
    scene.environmentIntensity = ENVIRONMENT_INTENSITY
    if (USE_BACKGROUND_MODE) scene.backgroundRotation = new THREE.Euler(...SPHERE_ROTATION)
    return () => {
      envMap.dispose()
      domeTexture.dispose()
      if (scene.background === envMap) scene.background = null
      if (scene.environment === envMap) scene.environment = null
    }
  }, [scene, envMap, domeTexture])

  if (USE_BACKGROUND_MODE) return null

  return (
    <mesh
      position={SPHERE_POSITION}
      rotation={SPHERE_ROTATION}
      scale={SPHERE_RADIUS}
      renderOrder={-10}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={domeTexture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}
