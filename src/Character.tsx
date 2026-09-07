import { useLoader, useFrame } from '@react-three/fiber'
import { useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { attachDRACO } from './draco'
import idleUrl from './assets/idle_compressed.glb'
import kissUrl from './assets/boy_kiss_compressed.glb'

interface CharacterProps {
  isKissing: boolean
  onKissEnd: () => void
}

useLoader.preload(GLTFLoader, idleUrl, attachDRACO)
useLoader.preload(GLTFLoader, kissUrl, attachDRACO)

const textureKeys = [
  'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'aoMap',
  'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap', 'envMap', 'displacementMap',
] as const

function disposeMeshResources(mesh: THREE.Mesh) {
  mesh.geometry?.dispose()
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const mat of mats) {
    for (const key of textureKeys) {
      const tex = ((mat as unknown as Record<string, unknown>)[key] as THREE.Texture | null) ?? null
      if (tex) tex.dispose()
    }
    mat.dispose()
  }
}

function freeInactiveModel(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) disposeMeshResources(obj as THREE.Mesh)
  })
}

export function Character({ isKissing, onKissEnd }: CharacterProps) {
  const idleRef = useRef<Group>(null)
  const kissRef = useRef<Group>(null)
  const finishedRef = useRef(false)

  const idle = useLoader(GLTFLoader, idleUrl, attachDRACO)
  const kiss = useLoader(GLTFLoader, kissUrl, attachDRACO)

  const kissAvailable = kiss.animations?.length > 0

  useEffect(() => {
    if (isKissing && !kissAvailable) {
      const t = setTimeout(onKissEnd, 50)
      return () => clearTimeout(t)
    }
  }, [isKissing, kissAvailable, onKissEnd])

  useEffect(() => {
    for (const root of [idle.scene, kiss.scene]) {
      root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).castShadow = true
      })
    }
  }, [idle.scene, kiss.scene])

  useEffect(() => {
    const inactive = isKissing ? idle.scene : kiss.scene
    freeInactiveModel(inactive)
  }, [isKissing, idle.scene, kiss.scene])

  const idleAnims = idle.animations?.length > 0 ? idle.animations : []
  const kissAnims = kiss.animations?.length > 0 ? kiss.animations : []

  const { actions: idleActions } = useAnimations(idleAnims, idleRef)
  const { actions: kissActions, mixer: kissMixer } = useAnimations(kissAnims, kissRef)

  const kissAction = kissAnims.length > 0 ? kissActions[Object.keys(kissActions)[0]] : undefined

  useEffect(() => {
    if (idleAnims.length === 0) return
    const name = Object.keys(idleActions)[0]
    const action = name ? idleActions[name] : undefined
    if (!action) return
    if (isKissing) {
      action.fadeOut(0.3)
    } else {
      action.reset().fadeIn(0.3).play()
    }
  }, [idleActions, isKissing, idleAnims.length])

  useEffect(() => {
    if (!isKissing || !kissAction || kissAnims.length === 0) return
    finishedRef.current = false
    kissAction.reset().fadeIn(0.1)
    kissAction.setLoop(THREE.LoopOnce, 1)
    kissAction.clampWhenFinished = true
    const onFinished = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      onKissEnd()
    }
    kissMixer.addEventListener('finished', onFinished)
    kissAction.play()
    return () => {
      kissMixer.removeEventListener('finished', onFinished)
    }
  }, [kissAction, isKissing, kissMixer, onKissEnd, kissAnims.length])

  useFrame(() => {
    if (!isKissing || !kissAction || finishedRef.current) return
    if (kissAction.time >= kissAction.getClip().duration - 0.001) {
      finishedRef.current = true
      onKissEnd()
    }
  })

  return (
    <group>
      <group ref={idleRef} visible={!isKissing}>
        <primitive object={idle.scene} />
      </group>
      <group ref={kissRef} visible={isKissing}>
        <primitive object={kiss.scene} />
      </group>
    </group>
  )
}
