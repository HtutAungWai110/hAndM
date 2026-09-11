import { useLoader, useFrame } from '@react-three/fiber'
import { useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { attachDRACO } from './draco'
import idleUrl from './assets/idle_compressed.glb'
import kissUrl from './assets/kiss_w_hearts_compressed.glb'
import flowersUrl from './assets/give_flowers_compressed.glb'

interface CharacterProps {
  isKissing: boolean
  onKissEnd: () => void
  isGivingFlowers: boolean
  onFlowersEnd: () => void
}

useLoader.preload(GLTFLoader, idleUrl, attachDRACO)
useLoader.preload(GLTFLoader, kissUrl, attachDRACO)
useLoader.preload(GLTFLoader, flowersUrl, attachDRACO)

export function Character({ isKissing, onKissEnd, isGivingFlowers, onFlowersEnd }: CharacterProps) {
  const idleRef = useRef<Group>(null)
  const kissRef = useRef<Group>(null)
  const flowersRef = useRef<Group>(null)
  const finishedRef = useRef(false)
  const flowersFinishedRef = useRef(false)

  const idle = useLoader(GLTFLoader, idleUrl, attachDRACO)
  const kiss = useLoader(GLTFLoader, kissUrl, attachDRACO)
  const flowers = useLoader(GLTFLoader, flowersUrl, attachDRACO)

  const kissAvailable = kiss.animations?.length > 0
  const flowersAvailable = flowers.animations?.length > 0

  useEffect(() => {
    if (isKissing && !kissAvailable) {
      const t = setTimeout(onKissEnd, 50)
      return () => clearTimeout(t)
    }
    if (isGivingFlowers && !flowersAvailable) {
      const t = setTimeout(onFlowersEnd, 50)
      return () => clearTimeout(t)
    }
  }, [isKissing, kissAvailable, isGivingFlowers, flowersAvailable, onKissEnd, onFlowersEnd])

  useEffect(() => {
    for (const root of [idle.scene, kiss.scene, flowers.scene]) {
      root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).castShadow = true
      })
    }
  }, [idle.scene, kiss.scene, flowers.scene])

  // Warm the GPU pipeline for the hidden animation models. They are mounted with
  // visible=false, so their geometry buffers are never uploaded and their shaders are
  // never compiled until the first button press. Doing that all at click time in one
  // synchronous burst crashes the WebKit tab on iOS ("Cannot open this page"). Render
  // every model for two frames right after mount so upload+compile happens during the
  // loading screen instead.
  useEffect(() => {
    const all = [idleRef.current, kissRef.current, flowersRef.current]
    const groups = all.filter((g): g is Group => g !== null)
    if (groups.length !== 3) return
    const prev = groups.map((g) => g.visible)
    for (const g of groups) g.visible = true
    const restore = () => {
      for (let i = 0; i < groups.length; i++) groups[i].visible = prev[i]
    }
    const id = requestAnimationFrame(() => requestAnimationFrame(restore))
    return () => {
      cancelAnimationFrame(id)
      restore()
    }
  }, [])

  const idleAnims = idle.animations?.length > 0 ? idle.animations : []
  const kissAnims = kiss.animations?.length > 0 ? kiss.animations : []
  const flowersAnims = flowers.animations?.length > 0 ? flowers.animations : []

  const { actions: idleActions } = useAnimations(idleAnims, idleRef)
  const { actions: kissActions, mixer: kissMixer } = useAnimations(kissAnims, kissRef)
  const { actions: flowersActions, mixer: flowersMixer } = useAnimations(flowersAnims, flowersRef)

  const kissAction = kissAnims.length > 0 ? kissActions[Object.keys(kissActions)[0]] : undefined
  const flowersAction = flowersAnims.length > 0 ? flowersActions[Object.keys(flowersActions)[0]] : undefined

  useEffect(() => {
    if (idleAnims.length === 0) return
    const name = Object.keys(idleActions)[0]
    const action = name ? idleActions[name] : undefined
    if (!action) return
    if (isKissing || isGivingFlowers) {
      action.fadeOut(0.3)
    } else {
      action.reset().fadeIn(0.3).play()
    }
  }, [idleActions, isKissing, isGivingFlowers, idleAnims.length])

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

  useEffect(() => {
    if (!isGivingFlowers || !flowersAction || flowersAnims.length === 0) return
    flowersFinishedRef.current = false
    flowersAction.reset().fadeIn(0.1)
    flowersAction.setLoop(THREE.LoopOnce, 1)
    flowersAction.clampWhenFinished = true
    const onFinished = () => {
      if (flowersFinishedRef.current) return
      flowersFinishedRef.current = true
      onFlowersEnd()
    }
    flowersMixer.addEventListener('finished', onFinished)
    flowersAction.play()
    return () => {
      flowersMixer.removeEventListener('finished', onFinished)
    }
  }, [flowersAction, isGivingFlowers, flowersMixer, onFlowersEnd, flowersAnims.length])

  useFrame(() => {
    if (isKissing && kissAction && !finishedRef.current && kissAction.time >= kissAction.getClip().duration - 0.001) {
      finishedRef.current = true
      onKissEnd()
    }
    if (isGivingFlowers && flowersAction && !flowersFinishedRef.current && flowersAction.time >= flowersAction.getClip().duration - 0.001) {
      flowersFinishedRef.current = true
      onFlowersEnd()
    }
  })

  return (
    <group>
      <group ref={idleRef} visible={!isKissing && !isGivingFlowers}>
        <primitive object={idle.scene} />
      </group>
      <group ref={kissRef} visible={isKissing}>
        <primitive object={kiss.scene} />
      </group>
      <group ref={flowersRef} visible={isGivingFlowers}>
        <primitive object={flowers.scene} />
      </group>
    </group>
  )
}