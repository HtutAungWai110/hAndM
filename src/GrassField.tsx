import { useLoader, useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { attachDRACO } from './draco'
import grassUrl from './assets/scene/grass_compressed.glb'

const WIND_SPEED = 0.4
const WIND_FREQUENCY = 1.8
const WIND_STRENGTH = 0.21

function collectGrassMeshes(scene: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = []
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh)
  })
  return meshes
}

function meshYBounds(mesh: THREE.Mesh) {
  const geo = mesh.geometry
  if (!geo.boundingBox) geo.computeBoundingBox()
  const minY = geo.boundingBox?.min.y ?? 0
  const height = Math.max((geo.boundingBox?.max.y ?? 0) - minY, 0.0001)
  return { groundY: minY, height }
}

function injectWindShader(
  material: THREE.Material,
  bounds: { groundY: number; height: number },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uHeight = { value: bounds.height }
    shader.vertexShader = `
      uniform float uTime;
      uniform float uHeight;
    ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float heightFactor = clamp((position.y - ${bounds.groundY.toFixed(6)}) / uHeight, 0.0, 1.0);
      float waveX = sin(uTime * ${WIND_SPEED} + position.x * ${WIND_FREQUENCY} + position.z * ${WIND_FREQUENCY} * 0.7);
      float waveZ = cos(uTime * ${WIND_SPEED} * 0.8 + position.z * ${WIND_FREQUENCY} + position.x * ${WIND_FREQUENCY} * 0.7);
      float bend = heightFactor * heightFactor * uHeight * ${WIND_STRENGTH};
      transformed.x += waveX * bend;
      transformed.z += waveZ * bend;
      `,
    )

    ;(material as THREE.Material).userData.uTimeUniform = shader.uniforms.uTime
  }
  material.needsUpdate = true
}

function createDepthMaterial(material: THREE.Material): THREE.MeshDepthMaterial {
  const depth = new THREE.MeshDepthMaterial()
  const source = material as THREE.MeshStandardMaterial
  if (source.map) {
    depth.map = source.map
    depth.alphaTest = source.alphaTest
  }
  return depth
}

export function GrassField() {
  const { scene } = useLoader(GLTFLoader, grassUrl, attachDRACO)
  const materialsRef = useRef<THREE.Material[]>([])

  useLayoutEffect(() => {
    const windMaterials: THREE.Material[] = []
    for (const mesh of collectGrassMeshes(scene)) {
      mesh.receiveShadow = true
      mesh.castShadow = true
      const bounds = meshYBounds(mesh)
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of mats) {
        injectWindShader(material, bounds)
        windMaterials.push(material)
        const depth = createDepthMaterial(material)
        injectWindShader(depth, bounds)
        ;(material as THREE.Material & { customDepthMaterial?: THREE.Material }).customDepthMaterial = depth
        windMaterials.push(depth)
      }
    }
    materialsRef.current = windMaterials
  }, [scene])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    for (const material of materialsRef.current) {
      const uniform = material.userData.uTimeUniform as { value: number } | undefined
      if (uniform) uniform.value = time
    }
  })

  return <primitive object={scene} scale={1} />
}
