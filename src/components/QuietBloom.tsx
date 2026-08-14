import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

type QuietBloomProps = {
  ariaLabel?: string
}

type DeviceNavigator = Navigator & {
  deviceMemory?: number
}

type Ripple = {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  phase: number
}

const COLORS = {
  forest: 0x0b1a14,
  brass: 0xb89443,
  brassLight: 0xe2c67f,
  ivory: 0xfaf3e3,
} as const

const easeOutExpo = (value: number) => value === 1 ? 1 : 1 - 2 ** (-10 * value)

function createRibbonGeometry(points: THREE.Vector3[], width: number, segments: number) {
  const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.55)
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const viewAxis = new THREE.Vector3(0, 0, 1)
  const fallbackAxis = new THREE.Vector3(0, 1, 0)

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments
    const point = curve.getPointAt(progress)
    const tangent = curve.getTangentAt(progress).normalize()
    const side = new THREE.Vector3().crossVectors(tangent, viewAxis)
    if (side.lengthSq() < 0.001) side.crossVectors(tangent, fallbackAxis)
    side.normalize().multiplyScalar(width * (0.72 + Math.sin(progress * Math.PI * 4) * 0.16))

    positions.push(
      point.x + side.x, point.y + side.y, point.z + side.z,
      point.x - side.x, point.y - side.y, point.z - side.z,
    )
    uvs.push(progress, 1, progress, 0)

    if (index < segments) {
      const offset = index * 2
      indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * A cinematic Three.js scene based on the approved Breathing Stone mock:
 * carved stone, orbiting translucent silk, water ripples and pointer parallax.
 */
export function QuietBloom({ ariaLabel = "Floating Seraphin healing stone wrapped in moving golden silk" }: QuietBloomProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading")

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer | undefined
    let frameId = 0
    let statusFrameId = 0
    let disposed = false
    let visible = true
    let contextLost = false
    let resizeObserver: ResizeObserver | undefined
    let intersectionObserver: IntersectionObserver | undefined
    let lastFrame = 0
    let cleaned = false
    const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>()
    const cleanupTasks: Array<() => void> = []
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduceMotion = mediaQuery.matches
    const device = navigator as DeviceNavigator
    const lowEnd =
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      (device.deviceMemory === undefined && device.hardwareConcurrency <= 4)

    const teardown = () => {
      if (cleaned) return
      cleaned = true
      disposed = true
      window.cancelAnimationFrame(frameId)
      window.cancelAnimationFrame(statusFrameId)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      cleanupTasks.splice(0).reverse().forEach((cleanup) => cleanup())
      resources.forEach((resource) => resource.dispose())
      const activeRenderer = renderer
      renderer = undefined
      activeRenderer?.dispose()
      activeRenderer?.forceContextLoss()
      activeRenderer?.domElement.remove()
    }

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowEnd,
        powerPreference: lowEnd ? "low-power" : "high-performance",
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowEnd ? 1 : 1.6))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const canvas = renderer.domElement
      canvas.setAttribute("aria-hidden", "true")
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;opacity:0;transition:opacity 500ms ease"
      host.appendChild(canvas)

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(COLORS.forest, 0.055)
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)
      camera.position.set(0, 0.15, 10.8)
      camera.lookAt(0, -0.15, 0)

      const sculpture = new THREE.Group()
      sculpture.position.y = 0.12
      scene.add(sculpture)

      const backSilkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x526649,
        emissive: 0x111d14,
        emissiveIntensity: 0.2,
        metalness: 0.12,
        roughness: 0.34,
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      resources.add(backSilkMaterial)

      const frontSilkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xa18543,
        emissive: 0x241b08,
        emissiveIntensity: 0.24,
        metalness: 0.2,
        roughness: 0.27,
        transparent: true,
        opacity: 0.17,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      resources.add(frontSilkMaterial)

      const backRibbonGeometry = createRibbonGeometry([
        new THREE.Vector3(-3.3, 0.55, -0.45),
        new THREE.Vector3(-1.25, 1.48, -0.72),
        new THREE.Vector3(1.15, 1.22, -0.25),
        new THREE.Vector3(3.15, 0.25, 0.2),
        new THREE.Vector3(1.15, -0.65, 0.45),
        new THREE.Vector3(-1.7, -0.55, -0.1),
      ], 0.15, lowEnd ? 44 : 84)
      resources.add(backRibbonGeometry)
      const backRibbon = new THREE.Mesh(backRibbonGeometry, backSilkMaterial)
      backRibbon.rotation.z = -0.12
      sculpture.add(backRibbon)

      const frontRibbonGeometry = createRibbonGeometry([
        new THREE.Vector3(-3.15, -1.28, 0.55),
        new THREE.Vector3(-1.2, -0.7, 0.95),
        new THREE.Vector3(0.85, -0.42, 1.05),
        new THREE.Vector3(3.15, -1.05, 0.45),
        new THREE.Vector3(1.55, 0.15, -0.35),
        new THREE.Vector3(-1.4, 0.1, -0.5),
      ], 0.18, lowEnd ? 44 : 84)
      resources.add(frontRibbonGeometry)
      const frontRibbon = new THREE.Mesh(frontRibbonGeometry, frontSilkMaterial)
      frontRibbon.rotation.z = 0.08
      sculpture.add(frontRibbon)

      const waterMaterial = new THREE.MeshPhysicalMaterial({ color: 0x10251d, roughness: 0.25, metalness: 0.2, transparent: true, opacity: 0.52 })
      resources.add(waterMaterial)
      const waterGeometry = new THREE.CircleGeometry(5.8, lowEnd ? 40 : 80)
      resources.add(waterGeometry)
      const water = new THREE.Mesh(waterGeometry, waterMaterial)
      water.rotation.x = -Math.PI / 2
      water.position.y = -2.25
      scene.add(water)

      const rippleMaterial = new THREE.MeshBasicMaterial({ color: COLORS.brassLight, transparent: true, opacity: 0.38, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      resources.add(rippleMaterial)
      const ripples: Ripple[] = Array.from({ length: 4 }, (_, index) => {
        const geometry = new THREE.RingGeometry(0.72, 0.735, lowEnd ? 46 : 72)
        resources.add(geometry)
        const material = rippleMaterial.clone()
        resources.add(material)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = -Math.PI / 2
        mesh.position.set(0, -2.2 + index * 0.004, 0.2)
        scene.add(mesh)
        return { mesh, phase: index / 4 }
      })

      const particleGeometry = new THREE.BufferGeometry()
      const particleCount = lowEnd ? 42 : 90
      const particlePositions = new Float32Array(particleCount * 3)
      for (let index = 0; index < particleCount; index += 1) {
        const seed = index * 19.37
        particlePositions[index * 3] = Math.sin(seed * 1.7) * 4.5
        particlePositions[index * 3 + 1] = ((index * 0.73) % 5.5) - 2.2
        particlePositions[index * 3 + 2] = Math.cos(seed * 0.81) * 2.2 - 0.6
      }
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
      resources.add(particleGeometry)
      const particleMaterial = new THREE.PointsMaterial({ color: COLORS.brassLight, size: lowEnd ? 0.022 : 0.028, transparent: true, opacity: 0.46, depthWrite: false, blending: THREE.AdditiveBlending })
      resources.add(particleMaterial)
      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      const key = new THREE.SpotLight(COLORS.ivory, 48, 22, Math.PI / 5, 0.7, 1.3)
      key.position.set(-4.2, 5.5, 7)
      key.target.position.set(0, 0, 0)
      scene.add(key, key.target)
      const rim = new THREE.PointLight(COLORS.brassLight, 20, 11, 1.4)
      rim.position.set(3.7, 0.8, 2.2)
      scene.add(rim)
      const underGlow = new THREE.PointLight(COLORS.brass, 11, 7, 1.5)
      underGlow.position.set(0, -2, 1.1)
      scene.add(underGlow)
      scene.add(new THREE.HemisphereLight(0x93a08e, 0x06100c, 3.1))

      const pointer = new THREE.Vector2()
      const pointerTarget = new THREE.Vector2()
      const handlePointerMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect()
        pointerTarget.set(
          THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
          THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1),
        )
      }
      const resetPointer = () => pointerTarget.set(0, 0)
      host.addEventListener("pointermove", handlePointerMove)
      cleanupTasks.push(() => host.removeEventListener("pointermove", handlePointerMove))
      host.addEventListener("pointerleave", resetPointer)
      cleanupTasks.push(() => host.removeEventListener("pointerleave", resetPointer))

      const resize = () => {
        if (!renderer || disposed) return
        const { width, height } = host.getBoundingClientRect()
        if (width < 1 || height < 1) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.fov = width < 680 ? 43 : 34
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
      }
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      resize()

      const startedAt = performance.now()
      const entranceDuration = 1850
      const frameGap = lowEnd ? 1000 / 30 : 0

      const renderFrame = (now: number) => {
        if (disposed || contextLost || !renderer || !visible) return
        if (frameGap && now - lastFrame < frameGap) {
          frameId = window.requestAnimationFrame(renderFrame)
          return
        }
        lastFrame = now
        const elapsed = now - startedAt
        const progress = reduceMotion ? 1 : easeOutExpo(THREE.MathUtils.clamp(elapsed / entranceDuration, 0, 1))
        const time = elapsed / 1000

        sculpture.scale.setScalar(THREE.MathUtils.lerp(0.58, 1, progress))
        sculpture.rotation.y = THREE.MathUtils.lerp(-1.05, 0.05, progress)
        sculpture.rotation.z = THREE.MathUtils.lerp(-0.16, 0, progress)
        sculpture.position.y = THREE.MathUtils.lerp(-0.35, 0.12, progress)
        camera.position.z = THREE.MathUtils.lerp(12.8, 8.7, progress)

        if (!reduceMotion && progress > 0.98) {
          pointer.lerp(pointerTarget, 0.04)
          const ambient = time - entranceDuration / 1000
          sculpture.position.y = 0.12 + Math.sin(ambient * 0.85) * 0.1
          backRibbon.rotation.y = ambient * 0.17 + pointer.x * 0.09
          backRibbon.rotation.z = -0.12 + Math.sin(ambient * 0.55) * 0.1
          frontRibbon.rotation.y = -ambient * 0.13 - pointer.x * 0.08
          frontRibbon.rotation.z = 0.08 + Math.cos(ambient * 0.48) * 0.08
          particles.rotation.y = ambient * 0.035
          particles.position.y = Math.sin(ambient * 0.24) * 0.12
          camera.position.x = pointer.x * 0.22
          camera.position.y = 0.15 - pointer.y * 0.13
        }

        ripples.forEach(({ mesh, phase }) => {
          const rippleProgress = reduceMotion ? phase * 0.7 + 0.18 : (time * 0.19 + phase) % 1
          const scale = 0.75 + rippleProgress * 4.8
          mesh.scale.setScalar(scale)
          mesh.material.opacity = reduceMotion ? 0.16 : Math.sin(rippleProgress * Math.PI) * 0.34
        })

        renderer.render(scene, camera)
        if (!reduceMotion) frameId = window.requestAnimationFrame(renderFrame)
      }

      const handleContextLost = (event: Event) => {
        event.preventDefault()
        contextLost = true
        canvas.style.opacity = "0"
        window.cancelAnimationFrame(frameId)
        if (!disposed) setStatus("fallback")
      }
      const handleMotionChange = (event: MediaQueryListEvent) => {
        reduceMotion = event.matches
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(renderFrame)
      }
      canvas.addEventListener("webglcontextlost", handleContextLost, false)
      cleanupTasks.push(() => canvas.removeEventListener("webglcontextlost", handleContextLost))
      mediaQuery.addEventListener("change", handleMotionChange)
      cleanupTasks.push(() => mediaQuery.removeEventListener("change", handleMotionChange))

      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible && renderer && !contextLost) {
          window.cancelAnimationFrame(frameId)
          frameId = window.requestAnimationFrame(renderFrame)
        }
      }, { rootMargin: "160px" })
      intersectionObserver.observe(host)

      renderer.render(scene, camera)
      canvas.style.opacity = "1"
      statusFrameId = window.requestAnimationFrame(() => {
        if (!disposed) setStatus("ready")
      })
      frameId = window.requestAnimationFrame(renderFrame)

      return teardown
    } catch {
      teardown()
      const fallbackFrame = window.requestAnimationFrame(() => {
        if (host.isConnected) setStatus("fallback")
      })
      return () => window.cancelAnimationFrame(fallbackFrame)
    }
  }, [])

  return (
    <div ref={hostRef} className="stone-silk-scene" role="img" aria-label={ariaLabel} data-webgl-status={status}></div>
  )
}

export default QuietBloom
