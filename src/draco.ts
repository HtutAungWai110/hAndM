import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { assetManager } from './loader'

export const dracoLoader = new DRACOLoader()

export function attachDRACO(loader: GLTFLoader) {
  loader.manager = assetManager
  loader.setDRACOLoader(dracoLoader)
}

export function createGLTFLoader(): GLTFLoader {
  const loader = new GLTFLoader()
  attachDRACO(loader)
  return loader
}
