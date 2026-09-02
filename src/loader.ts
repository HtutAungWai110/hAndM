import * as THREE from 'three'

interface LoaderState {
  loaded: number
  total: number
}

let state: LoaderState = { loaded: 0, total: 0 }
const listeners = new Set<() => void>()

function set(next: LoaderState) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): LoaderState {
  return state
}

export const assetManager = new THREE.LoadingManager()
assetManager.onStart = (_url, loaded, total) => set({ loaded, total })
assetManager.onProgress = (_url, loaded, total) => set({ loaded, total })
assetManager.onLoad = () => {}   // loaded === total already set by final onProgress
assetManager.onError = () => set({ loaded: 1, total: 1 })

export { subscribe, getSnapshot }