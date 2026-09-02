import { useLoader, useFrame } from '@react-three/fiber'
import { useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'
import { assetManager } from './loader'
import idleUrl from './assets/idle_compressed.glb'
import kissUrl from './assets/boy_kiss_compressed.glb'

interface CharacterProps {
  isKissing: boolean
  onKissEnd: () => void
}

const dracoLoader = new DRACOLoader()

function attachDRACO(loader: GLTFLoader) {
  loader.manager = assetManager
  loader.setDRACOLoader(dracoLoader)
}

useLoader.preload(GLTFLoader, idleUrl, attachDRACO)
useLoader.preload(GLTFLoader, kissUrl, attachDRACO)

export function Character({ isKissing, onKissEnd }: CharacterProps) {
  const idleRef = useRef<Group>(null)
  const kissRef = useRef<Group>(null)
  const finishedRef = useRef(false)

  const idle = useLoader(GLTFLoader, idleUrl, attachDRACO)
  const kiss = useLoader(GLTFLoader, kissUrl, attachDRACO)

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
