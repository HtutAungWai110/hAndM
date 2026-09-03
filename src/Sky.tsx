import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { assetManager } from './loader'
import hriUrl from './assets/hri/little_paris_eiffel_tower_4k.hdr'

const SPHERE_Y_OFFSET = 50

export function Sky() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  const sphereGeo = useMemo(
    () => new THREE.SphereGeometry(100),
    [],
  )

  useEffect(() => {
    const loader = new RGBELoader(assetManager)
    let texture: THREE.DataTexture | null = null
    let cancelled = false

    loader.load(
      hriUrl,
      (tex) => {
        if (cancelled) return
        texture = tex
        tex.mapping = THREE.EquirectangularReflectionMapping
        tex.colorSpace = THREE.SRGBColorSpace
        if (matRef.current) {
          matRef.current.map = tex
          matRef.current.needsUpdate = true
        }
        const pmrem = new THREE.PMREMGenerator(gl)
        const envRT = pmrem.fromEquirectangular(tex)
        scene.environment = envRT.texture
        pmrem.dispose()
      },
      undefined,
      (err) => {
        console.error('[Sky] HDR load failed:', err)
      },
    )

    return () => {
      cancelled = true
      scene.environment = null
      texture?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene])

  return (
    <group rotation={[0, 1, 0]} position={[0, SPHERE_Y_OFFSET, -30]}>
      <mesh geometry={sphereGeo} renderOrder={-1} frustumCulled={false}>
        <meshBasicMaterial ref={matRef} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
