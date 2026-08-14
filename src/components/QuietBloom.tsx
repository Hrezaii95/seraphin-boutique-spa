import { useEffect, useId, useRef, useState } from "react"
import * as THREE from "three"

type QuietBloomProps = {
  ariaLabel?: string
}

type DeviceNavigator = Navigator & {
  deviceMemory?: number
}

type PetalState = {
  pivot: THREE.Group
  material: THREE.MeshStandardMaterial
  radius: number
  delay: number
}

const PALETTE = {
  forest: 0x20352a,
  olive: 0x949565,
  cocoa: 0x503224,
  parchment: 0xe8e0d5,
  brass: 0x907631,
  ivory: 0xfaf3e3,
} as const

const FALLBACK_PETALS = [
  "#20352A",
  "#949565",
  "#503224",
  "#E8E0D5",
  "#2E3C2C",
  "#949565",
  "#503224",
  "#E8E0D5",
  "#20352A",
]

function easeOutQuint(value: number) {
  return 1 - (1 - value) ** 5
}

function createLeafGeometry(lowEnd: boolean) {
  const leaf = new THREE.Shape()
  leaf.moveTo(0, -0.82)
  leaf.bezierCurveTo(-0.42, -0.7, -0.76, -0.22, -0.62, 0.28)
  leaf.bezierCurveTo(-0.52, 0.62, -0.2, 0.88, 0, 1.02)
  leaf.bezierCurveTo(0.2, 0.88, 0.52, 0.62, 0.62, 0.28)
  leaf.bezierCurveTo(0.76, -0.22, 0.42, -0.7, 0, -0.82)

  const geometry = new THREE.ExtrudeGeometry(leaf, {
    depth: 0.095,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: lowEnd ? 1 : 3,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    curveSegments: lowEnd ? 8 : 16,
  })
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}

function QuietBloomFallback({ gradientId }: { gradientId: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        width: "min(92%, 620px)",
        height: "auto",
        filter: "drop-shadow(0 34px 48px rgba(32, 53, 42, 0.16))",
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C3AC69" />
          <stop offset="0.5" stopColor="#907631" />
          <stop offset="1" stopColor="#69531F" />
        </linearGradient>
      </defs>
      <g transform="translate(280 280)">
        {FALLBACK_PETALS.map((color, index) => (
          <path
            // The index is stable because the nine petals are a fixed brand mark.
            key={index}
            d="M0 -42 C-38 -56 -76 -104 -58 -158 C-48 -188 -18 -211 0 -224 C18 -211 48 -188 58 -158 C76 -104 38 -56 0 -42Z"
            fill={color}
            stroke="#907631"
            strokeOpacity="0.3"
            strokeWidth="2"
            transform={`rotate(${index * 40})`}
          />
        ))}
        <rect
          x="-43"
          y="-43"
          width="86"
          height="86"
          rx="4"
          fill={`url(#${gradientId})`}
          transform="rotate(45)"
        />
        <rect
          x="-28"
          y="-28"
          width="56"
          height="56"
          rx="3"
          fill="#20352A"
          transform="rotate(45)"
        />
      </g>
    </svg>
  )
}

/**
 * Seraphin's signature WebGL sculpture. It opens once, then rests with only a
 * restrained ambient drift. The SVG underneath is both the loading state and
 * the permanent fallback when WebGL is unavailable.
 */
export function QuietBloom({ ariaLabel = "Seraphin Quiet Bloom botanical sculpture" }: QuietBloomProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gradientId = `quiet-bloom-${useId().replaceAll(":", "")}`
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
    let lastFrame = 0
    let resizeObserver: ResizeObserver | undefined
    let intersectionObserver: IntersectionObserver | undefined
    const resources = new Set<THREE.BufferGeometry | THREE.Material>()

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduceMotion = mediaQuery.matches
    const device = navigator as DeviceNavigator
    const lowEnd =
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      (device.deviceMemory === undefined && device.hardwareConcurrency <= 4)

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowEnd,
        powerPreference: lowEnd ? "low-power" : "high-performance",
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowEnd ? 1 : 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.02

      const canvas = renderer.domElement
      canvas.setAttribute("aria-hidden", "true")
      canvas.style.position = "absolute"
      canvas.style.inset = "0"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.display = "block"
      canvas.style.zIndex = "1"
      canvas.style.opacity = "0"
      canvas.style.transition = reduceMotion ? "none" : "opacity 320ms ease"
      host.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30)
      camera.position.set(0, 0.05, 10)
      camera.lookAt(0, 0, 0)

      const bloom = new THREE.Group()
      bloom.rotation.set(-0.12, -0.16, 0)
      scene.add(bloom)

      const leafGeometry = createLeafGeometry(lowEnd)
      resources.add(leafGeometry)
      const edgeGeometry = new THREE.EdgesGeometry(leafGeometry, 24)
      resources.add(edgeGeometry)
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: PALETTE.brass,
        transparent: true,
        opacity: 0.24,
      })
      resources.add(edgeMaterial)

      const petalColors = [
        PALETTE.forest,
        PALETTE.olive,
        PALETTE.cocoa,
        PALETTE.parchment,
        0x2e3c2c,
        PALETTE.olive,
        PALETTE.cocoa,
        PALETTE.parchment,
        PALETTE.forest,
      ]
      const petals: PetalState[] = []

      petalColors.forEach((color, index) => {
        const angle = (index / petalColors.length) * Math.PI * 2
        const radius = index % 2 === 0 ? 1.48 : 1.38
        const pivot = new THREE.Group()
        const material = new THREE.MeshStandardMaterial({
          color,
          metalness: color === PALETTE.parchment ? 0.1 : 0.04,
          roughness: color === PALETTE.parchment ? 0.58 : 0.72,
          transparent: true,
          opacity: reduceMotion ? 1 : 0.2,
        })
        resources.add(material)

        const leaf = new THREE.Mesh(leafGeometry, material)
        const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial)
        leaf.position.y = radius
        edge.position.y = radius
        leaf.position.z = index % 2 === 0 ? 0.06 : -0.04
        edge.position.z = leaf.position.z + 0.055

        pivot.rotation.z = angle
        pivot.rotation.x = index % 2 === 0 ? -0.035 : 0.025
        if (!reduceMotion) {
          leaf.position.y = radius * 0.54
          edge.position.y = radius * 0.54
          pivot.scale.set(0.76, 0.22, 0.74)
        }
        pivot.add(leaf, edge)
        bloom.add(pivot)
        petals.push({ pivot, material, radius, delay: index * 22 })
      })

      const diamondShape = new THREE.Shape()
      diamondShape.moveTo(0, 0.61)
      diamondShape.lineTo(0.61, 0)
      diamondShape.lineTo(0, -0.61)
      diamondShape.lineTo(-0.61, 0)
      diamondShape.closePath()
      const diamondGeometry = new THREE.ExtrudeGeometry(diamondShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelSegments: lowEnd ? 1 : 3,
        bevelSize: 0.045,
        bevelThickness: 0.04,
      })
      diamondGeometry.center()
      resources.add(diamondGeometry)
      const brassMaterial = new THREE.MeshStandardMaterial({
        color: PALETTE.brass,
        metalness: 0.52,
        roughness: 0.38,
      })
      resources.add(brassMaterial)
      const diamond = new THREE.Mesh(diamondGeometry, brassMaterial)
      diamond.position.z = 0.14
      if (!reduceMotion) diamond.scale.setScalar(0.62)
      bloom.add(diamond)

      const insetGeometry = new THREE.OctahedronGeometry(0.37, lowEnd ? 0 : 1)
      resources.add(insetGeometry)
      const insetMaterial = new THREE.MeshStandardMaterial({
        color: PALETTE.forest,
        metalness: 0.08,
        roughness: 0.64,
      })
      resources.add(insetMaterial)
      const inset = new THREE.Mesh(insetGeometry, insetMaterial)
      inset.scale.set(reduceMotion ? 1 : 0.62, reduceMotion ? 1 : 0.62, reduceMotion ? 0.24 : 0.1488)
      inset.position.z = 0.32
      inset.rotation.z = Math.PI / 4
      bloom.add(inset)

      const warmKey = new THREE.DirectionalLight(PALETTE.ivory, 3.1)
      warmKey.position.set(-3.8, 4.8, 6)
      scene.add(warmKey)
      const brassRim = new THREE.DirectionalLight(0xc3ac69, 2.1)
      brassRim.position.set(4.6, -2.4, 4.2)
      scene.add(brassRim)
      scene.add(new THREE.HemisphereLight(PALETTE.parchment, PALETTE.forest, 1.45))

      const resize = () => {
        if (!renderer || disposed) return
        const { width, height } = host.getBoundingClientRect()
        if (width < 1 || height < 1) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        const halfBloomSpan = 2.62
        const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov * 0.5)
        const distanceForHeight = halfBloomSpan / Math.tan(halfVerticalFov)
        const distanceForWidth = distanceForHeight / camera.aspect
        camera.position.z = Math.max(distanceForHeight, distanceForWidth) * 1.04
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
      }
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      resize()

      const startedAt = performance.now()
      const openingDuration = 900
      const targetFrameGap = lowEnd ? 1000 / 30 : 0

      const renderFrame = (now: number) => {
        if (disposed || contextLost || !renderer) return
        if (!visible) return
        if (targetFrameGap && now - lastFrame < targetFrameGap) {
          frameId = window.requestAnimationFrame(renderFrame)
          return
        }
        lastFrame = now

        const elapsed = now - startedAt
        petals.forEach(({ pivot, material, radius, delay }) => {
          const progress = reduceMotion
            ? 1
            : THREE.MathUtils.clamp((elapsed - delay) / (openingDuration - delay), 0, 1)
          const eased = easeOutQuint(progress)
          const currentRadius = THREE.MathUtils.lerp(radius * 0.54, radius, eased)
          pivot.children.forEach((child) => {
            child.position.y = currentRadius
          })
          pivot.scale.set(
            THREE.MathUtils.lerp(0.76, 1, eased),
            THREE.MathUtils.lerp(0.22, 1, eased),
            THREE.MathUtils.lerp(0.74, 1, eased),
          )
          material.opacity = THREE.MathUtils.lerp(0.2, 1, eased)
        })

        const centerProgress = reduceMotion
          ? 1
          : easeOutQuint(THREE.MathUtils.clamp(elapsed / openingDuration, 0, 1))
        const centerScale = THREE.MathUtils.lerp(0.62, 1, centerProgress)
        diamond.scale.setScalar(centerScale)
        inset.scale.set(centerScale, centerScale, 0.24 * centerScale)

        if (!reduceMotion && elapsed > openingDuration) {
          const ambientTime = elapsed - openingDuration
          bloom.rotation.z = Math.sin(ambientTime * (Math.PI * 2) / 12000) * 0.026
          bloom.rotation.y = -0.16 + Math.sin(ambientTime * (Math.PI * 2) / 9000) * 0.022
          bloom.rotation.x = -0.12 + Math.cos(ambientTime * (Math.PI * 2) / 11000) * 0.011
          const breath = 1 + Math.sin(ambientTime * (Math.PI * 2) / 10000) * 0.006
          bloom.scale.setScalar(breath)
        }

        renderer.render(scene, camera)
        if (!reduceMotion) frameId = window.requestAnimationFrame(renderFrame)
      }

      const onContextLost = (event: Event) => {
        event.preventDefault()
        contextLost = true
        canvas.style.opacity = "0"
        window.cancelAnimationFrame(frameId)
        if (!disposed) setStatus("fallback")
      }
      canvas.addEventListener("webglcontextlost", onContextLost, false)

      const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
        reduceMotion = event.matches
        canvas.style.transition = reduceMotion ? "none" : "opacity 320ms ease"
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(renderFrame)
      }
      mediaQuery.addEventListener("change", onMotionPreferenceChange)

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? true
          if (visible && renderer && !contextLost) {
            window.cancelAnimationFrame(frameId)
            frameId = window.requestAnimationFrame(renderFrame)
          }
        },
        { rootMargin: "120px" },
      )
      intersectionObserver.observe(host)

      renderer.render(scene, camera)
      canvas.style.opacity = "1"
      statusFrameId = window.requestAnimationFrame(() => {
        if (!disposed) setStatus("ready")
      })
      frameId = window.requestAnimationFrame(renderFrame)

      return () => {
        disposed = true
        window.cancelAnimationFrame(frameId)
        window.cancelAnimationFrame(statusFrameId)
        resizeObserver?.disconnect()
        intersectionObserver?.disconnect()
        canvas.removeEventListener("webglcontextlost", onContextLost)
        mediaQuery.removeEventListener("change", onMotionPreferenceChange)
        resources.forEach((resource) => resource.dispose())
        renderer?.dispose()
        renderer?.forceContextLoss()
        canvas.remove()
      }
    } catch {
      if (!disposed) setStatus("fallback")
      renderer?.dispose()
      renderer?.domElement.remove()
      resources.forEach((resource) => resource.dispose())
    }
  }, [])

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={ariaLabel}
      data-webgl-status={status}
      style={{
        position: "relative",
        isolation: "isolate",
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        minHeight: "clamp(360px, 58vw, 700px)",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 48%, rgba(211, 198, 165, 0.32) 0%, rgba(250, 243, 227, 0) 64%)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          display: "grid",
          placeItems: "center",
          opacity: status === "ready" ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        <QuietBloomFallback gradientId={gradientId} />
      </div>
    </div>
  )
}

export default QuietBloom
