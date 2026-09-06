import { useMemo } from 'react'
import * as THREE from 'three'
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js'

export function Sky() {
  const sky = useMemo(() => {
    const s = new ThreeSky()
    s.scale.setScalar(1000)

    const uniforms = s.material.uniforms
    uniforms['turbidity'].value = 10
    uniforms['rayleigh'].value = 2
    uniforms['mieCoefficient'].value = 0.005
    uniforms['mieDirectionalG'].value = 0.8
    const sun = new THREE.Vector3()
    sun.setFromSphericalCoords(1, Math.PI / 2 - 0.2, 0.5)
    uniforms['sunPosition'].value.copy(sun)

    return s
  }, [])

  return <primitive object={sky} />
}
