import * as THREE from 'three'

export interface LoaderState {
  loaded: number
  total: number
  error: string | null
}

let state: LoaderState = { loaded: 0, total: 0, error: null }
const listeners = new Set<() => void>()

function emit(next: LoaderState) {
  state = next
  listeners.forEach((fn) => fn())
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
assetManager.onStart = (_url, loaded, total) => {
  emit({ loaded, total, error: null })
}
assetManager.onProgress = (_url, loaded, total) => {
  emit({ loaded, total, error: null })
}
assetManager.onLoad = () => {}
assetManager.onError = (url) => {
  console.error('[assetManager] failed to load:', url)
  emit({ loaded: 0, total: 0, error: `Failed to load: ${url}` })
}

export { subscribe, getSnapshot }
