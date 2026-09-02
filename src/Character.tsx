import { useLoader, useFrame } from '@react-three/fiber'
import { useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'
import { assetManager } from './loader'
import idleUrl from './assets/idle_animation_export.glb'
import kissUrl from './assets/boy_kiss_animation_export.glb'

interface CharacterProps {
  isKissing: boolean
  onKissEnd: () => void
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/')

const attachManager = (loader: GLTFLoader) => {
  loader.manager = assetManager
  loader.setDRACOLoader(dracoLoader)
}

useLoader.preload(GLTFLoader, idleUrl, attachManager)
useLoader.preload(GLTFLoader, kissUrl, attachManager)

export function Character({ isKissing, onKissEnd }: CharacterProps) {
  const idleRef = useRef<Group>(null)
  const kissRef = useRef<Group>(null)
  const finishedRef = useRef(false)

  const idle = useLoader(GLTFLoader, idleUrl, attachManager)
  const kiss = useLoader(GLTFLoader, kissUrl, attachManager)
  const { actions: idleActions } = useAnimations(idle.animations, idleRef)
  const { actions: kissActions, mixer: kissMixer } = useAnimations(kiss.animations, kissRef)
  const kissAction = kissActions[Object.keys(kissActions)[0]]

  useEffect(() => {
    const name = Object.keys(idleActions)[0]
    const action = name ? idleActions[name] : undefined
    if (!action) return
    if (isKissing) {
      action.fadeOut(0.3)
    } else {
      action.reset().fadeIn(0.3).play()
    }
  }, [idleActions, isKissing])

  useEffect(() => {
    if (!isKissing || !kissAction) return
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
  }, [kissAction, isKissing, kissMixer, onKissEnd])

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