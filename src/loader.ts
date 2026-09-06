import * as THREE from 'three'

export interface LoaderState {
  loaded: number
  total: number
  error: string | null
}

let state: LoaderState = { loaded: 0, total: 0, error: null }
const listeners = new Set<() => void>()
let pending: LoaderState | null = null
let timer: ReturnType<typeof setTimeout> | null = null

const THROTTLE_MS = 40

function flush() {
  timer = null
  if (pending) {
    state = pending
    pending = null
    listeners.forEach((fn) => fn())
  }
}

function emit(next: LoaderState) {
  if (
    next.loaded === state.loaded &&
    next.total === state.total &&
    next.error === state.error
  ) {
    return
  }
  pending = next
  if (timer === null) timer = setTimeout(flush, THROTTLE_MS)
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
