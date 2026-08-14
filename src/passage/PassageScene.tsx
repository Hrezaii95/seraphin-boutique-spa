import { PerformanceMonitor, useGLTF } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react"
import * as THREE from "three"

export type QualityTier = "high" | "balanced" | "low" | "fallback"

type SceneProps = {
  progressRef: MutableRefObject<number>
  pointerRef: MutableRefObject<{ x: number; y: number }>
  reducedMotion: boolean
  quality: QualityTier
  onQualityChange: (quality: QualityTier) => void
  onReady: () => void
  onFallback: () => void
  ariaLabel: string
}

const modelUrl = "./models/seraphin-passage.glb"

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smoothstep = (from: number, to: number, value: number) => {
  const progress = clamp01((value - from) / (to - from))
  return progress * progress * (3 - 2 * progress)
}

const mapJourneyProgress = (progress: number) => {
  if (progress < 0.15) return (progress / 0.15) * 0.14
  if (progress < 0.39) return 0.14 + ((progress - 0.15) / 0.24) * 0.28
  if (progress < 0.67) return 0.42 + ((progress - 0.39) / 0.28) * 0.2
  return 0.62 + ((progress - 0.67) / 0.33) * 0.38
}

function SceneLoading() { return null }

function ContextGuard({ onFallback }: { onFallback: () => void }) {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const handleLoss = (event: Event) => {
      event.preventDefault()
      onFallback()
    }
    canvas.addEventListener("webglcontextlost", handleLoss)
    return () => canvas.removeEventListener("webglcontextlost", handleLoss)
  }, [gl, onFallback])
  return null
}

function PassageWorld({ progressRef, pointerRef, reducedMotion, quality, onReady }: Omit<SceneProps, "onQualityChange" | "onFallback" | "ariaLabel">) {
  const gltf = useGLTF(modelUrl)
  const { camera } = useThree()
  const world = useMemo(() => {
    const clone = gltf.scene.clone(true)
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry = object.geometry.clone()
      if (Array.isArray(object.material)) object.material = object.material.map((item) => item.clone())
      else object.material = object.material.clone()
    })
    return clone
  }, [gltf.scene])
  const initialized = useRef(false)
  const smoothedProgress = useRef(reducedMotion ? 1 : 0)
  const smoothedPointer = useRef(new THREE.Vector2())
  const cameraCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.65, 10.5),
    new THREE.Vector3(0, 0.3, 6.1),
    new THREE.Vector3(0.3, 0.18, 2.35),
    new THREE.Vector3(0.55, 0.68, -2.7),
    new THREE.Vector3(0.72, 0.88, -8.1),
    new THREE.Vector3(-0.28, 1.15, -14.7),
    new THREE.Vector3(0, 1.32, -21.7),
  ], false, "catmullrom", 0.42), [])
  const targetCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.3, 1.2),
    new THREE.Vector3(0, 0.1, -0.4),
    new THREE.Vector3(-1.35, 0.2, -5.5),
    new THREE.Vector3(1.35, 0.55, -10.5),
    new THREE.Vector3(0, 0.85, -16.8),
    new THREE.Vector3(0, 1.1, -24.3),
  ], false, "catmullrom", 0.45), [])

  const petals = useMemo(() => {
    const result: THREE.Object3D[] = []
    world.traverse((object) => {
      if (object.name.startsWith("BloomPetal")) {
        object.userData.closedRotation = object.rotation.clone()
        result.push(object)
      }
    })
    return result
  }, [world])

  const materials = useMemo(() => {
    const oil: THREE.MeshPhysicalMaterial[] = []
    const emissive: THREE.MeshStandardMaterial[] = []
    world.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.castShadow = quality !== "low"
      object.receiveShadow = true
      const source = object.material
      const list = Array.isArray(source) ? source : [source]
      list.forEach((material) => {
        if (material.name.includes("Oil") && material instanceof THREE.MeshPhysicalMaterial) oil.push(material)
        if (material.name.includes("Glow") && material instanceof THREE.MeshStandardMaterial) emissive.push(material)
      })
    })
    return { oil, emissive }
  }, [quality, world])

  const stageObjects = useMemo(() => {
    const stone: THREE.Object3D[] = []
    const oil: THREE.Object3D[] = []
    const linen: THREE.Object3D[] = []
    const sanctuary: THREE.Object3D[] = []
    world.traverse((object) => {
      if (object.name === "StoneRitual" || object.name.startsWith("HeatRing")) stone.push(object)
      if (object.name.startsWith("Oil")) oil.push(object)
      if (object.name.startsWith("LinenPassage") || object.name.startsWith("LinenRail") || object.name.startsWith("Herbal")) linen.push(object)
      if (object.name.startsWith("Sanctuary")) sanctuary.push(object)
    })
    return { stone, oil, linen, sanctuary }
  }, [world])

  useEffect(() => {
    onReady()
    return () => {
      world.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        const material = Array.isArray(object.material) ? object.material : [object.material]
        material.forEach((item) => item.dispose())
      })
    }
  }, [onReady, world])

  useFrame((state, delta) => {
    const targetProgress = reducedMotion ? 1 : progressRef.current
    const easing = 1 - Math.exp(-delta * 5.5)
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, targetProgress, easing)
    const progress = smoothedProgress.current
    const pathProgress = clamp01(mapJourneyProgress(progress))
    const position = cameraCurve.getPointAt(pathProgress)
    const target = targetCurve.getPointAt(Math.min(pathProgress, 0.999))

    smoothedPointer.current.x = THREE.MathUtils.damp(smoothedPointer.current.x, pointerRef.current.x, 5, delta)
    smoothedPointer.current.y = THREE.MathUtils.damp(smoothedPointer.current.y, pointerRef.current.y, 5, delta)
    const pointerStrength = quality === "low" || reducedMotion ? 0 : (1 - smoothstep(0.74, 0.98, progress))
    position.x += smoothedPointer.current.x * 0.18 * pointerStrength
    position.y -= smoothedPointer.current.y * 0.1 * pointerStrength
    camera.position.copy(position)
    camera.lookAt(target)

    const opening = smoothstep(0.07, 0.28, progress)
    petals.forEach((petal, index) => {
      const base = petal.userData.closedRotation as THREE.Euler
      const alternating = index % 2 ? 1 : -1
      petal.rotation.x = base.x + opening * (0.72 + (index % 3) * 0.08)
      petal.rotation.y = base.y + opening * alternating * 0.12
      petal.rotation.z = base.z + opening * alternating * 0.08
    })

    const time = state.clock.elapsedTime
    world.getObjectByName("BloomCore")?.scale.setScalar(1 + opening * 0.3 + Math.sin(time * 1.1) * 0.025)
    const stone = world.getObjectByName("StoneRitual")
    if (stone) stone.rotation.y = Math.sin(time * 0.17) * 0.08
    const linen = world.getObjectByName("LinenPassage")
    if (linen) linen.rotation.z = Math.sin(time * 0.34) * (quality === "low" ? 0.012 : 0.028)
    const compress = world.getObjectByName("HerbalCompress")
    if (compress) compress.rotation.y = Math.sin(time * 0.26) * 0.11
    const mark = world.getObjectByName("SanctuaryMark")
    if (mark) mark.rotation.z = Math.sin(time * 0.18) * 0.04

    const oilReveal = smoothstep(0.36, 0.63, progress) * (1 - smoothstep(0.72, 0.9, progress))
    materials.oil.forEach((material) => {
      material.opacity = 0.36 + oilReveal * 0.58
      material.transparent = true
      material.depthWrite = false
      material.emissiveIntensity = 0.12 + oilReveal * 0.45
    })
    materials.emissive.forEach((material) => {
      material.emissiveIntensity = 0.55 + smoothstep(0.7, 1, progress) * 1.2
    })
    stageObjects.stone.forEach((object) => { object.visible = progress >= 0.13 })
    stageObjects.oil.forEach((object) => { object.visible = progress >= 0.36 })
    stageObjects.linen.forEach((object) => { object.visible = progress >= 0.4 })
    stageObjects.sanctuary.forEach((object) => { object.visible = progress >= 0.62 })

    if (!initialized.current) initialized.current = true
  })

  return (
    <>
      <color attach="background" args={["#06100c"]} />
      <fogExp2 attach="fog" args={["#07140f", 0.023]} />
      <primitive object={world} />
      <ambientLight intensity={0.42} color="#a7bca8" />
      <directionalLight position={[-4, 7, 8]} intensity={quality === "high" ? 2.8 : 2.2} color="#ffe2a6" castShadow={quality !== "low"} shadow-mapSize-width={quality === "high" ? 1024 : 512} shadow-mapSize-height={quality === "high" ? 1024 : 512} />
      <pointLight position={[0, 1, 2]} intensity={13} distance={13} color="#c99643" />
      <pointLight position={[1, 2, -12]} intensity={8} distance={11} color="#6f9a74" />
      <pointLight position={[0, 3, -23]} intensity={20} distance={15} color="#e7b868" />
    </>
  )
}

export function PassageScene(props: SceneProps) {
  const { quality, onQualityChange, onFallback, ariaLabel } = props
  const dpr: [number, number] = quality === "high" ? [1, 1.5] : quality === "balanced" ? [0.85, 1.2] : [0.7, 1]

  return (
    <div className="passage-scene" role="img" aria-label={ariaLabel} data-quality={quality}>
      <Canvas
        dpr={dpr}
        camera={{ fov: 44, near: 0.1, far: 80, position: [0, 0.65, 10.5] }}
        gl={{
          antialias: quality !== "low",
          alpha: false,
          powerPreference: quality === "low" ? "low-power" : "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: quality === "high" ? 1.08 : 1,
        }}
      >
        <ContextGuard onFallback={onFallback} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => onQualityChange(quality === "high" ? "balanced" : "low")}
          onIncline={() => {
            if (quality === "low") onQualityChange("balanced")
          }}
        >
          <Suspense fallback={<SceneLoading />}>
            <PassageWorld {...props} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}

useGLTF.preload(modelUrl)

export default PassageScene
