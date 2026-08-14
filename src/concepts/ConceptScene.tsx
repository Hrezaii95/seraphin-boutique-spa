import { useEffect, useRef } from "react"
import * as THREE from "three"

export type SceneKind = "lotus" | "threshold" | "oracle"

type DeviceNavigator = Navigator & { deviceMemory?: number }

function createPetalGeometry(lowEnd: boolean) {
  const shape = new THREE.Shape()
  shape.moveTo(0, -0.7)
  shape.bezierCurveTo(-0.48, -0.42, -0.46, 0.48, 0, 0.92)
  shape.bezierCurveTo(0.46, 0.48, 0.48, -0.42, 0, -0.7)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelSegments: lowEnd ? 1 : 3,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: lowEnd ? 8 : 18,
  })
  geometry.center()
  return geometry
}

export function ConceptScene({ kind, active = false }: { kind: SceneKind; active?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const renderActiveRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    activeRef.current = active
    if (hostRef.current) hostRef.current.dataset.sceneActive = String(active)
    renderActiveRef.current?.()
  }, [active])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer | undefined
    let frame = 0
    let visible = true
    let disposed = false
    let lastFrame = 0
    let resizeObserver: ResizeObserver | undefined
    let intersectionObserver: IntersectionObserver | undefined
    const resources = new Set<THREE.BufferGeometry | THREE.Material>()
    const cleanups: Array<() => void> = []
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const device = navigator as DeviceNavigator
    const lowEnd = (device.deviceMemory !== undefined && device.deviceMemory <= 2) || navigator.hardwareConcurrency <= 4

    const dispose = () => {
      if (disposed) return
      disposed = true
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      cleanups.splice(0).reverse().forEach((cleanup) => cleanup())
      resources.forEach((resource) => resource.dispose())
      const activeRenderer = renderer
      renderer = undefined
      activeRenderer?.dispose()
      activeRenderer?.forceContextLoss()
      activeRenderer?.domElement.remove()
    }

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lowEnd, powerPreference: lowEnd ? "low-power" : "high-performance" })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowEnd ? 1 : 1.45))
      renderer.setClearColor(0, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.12
      const canvas = renderer.domElement
      canvas.setAttribute("aria-hidden", "true")
      canvas.className = "concept-scene__canvas"
      host.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(kind === "threshold" ? 48 : 38, 1, 0.1, 40)
      camera.position.set(0, 0, kind === "threshold" ? 7.4 : 8)
      const root = new THREE.Group()
      scene.add(root)

      const pointer = new THREE.Vector2()
      const pointerTarget = new THREE.Vector2()
      const onPointerMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect()
        pointerTarget.set(((event.clientX - rect.left) / rect.width - 0.5) * 2, ((event.clientY - rect.top) / rect.height - 0.5) * 2)
      }
      const onPointerLeave = () => pointerTarget.set(0, 0)
      host.addEventListener("pointermove", onPointerMove)
      cleanups.push(() => host.removeEventListener("pointermove", onPointerMove))
      host.addEventListener("pointerleave", onPointerLeave)
      cleanups.push(() => host.removeEventListener("pointerleave", onPointerLeave))

      const lotusPetals: THREE.Group[] = []
      let lotusCenter: THREE.Mesh | undefined
      const thresholdFrames: THREE.LineSegments[] = []
      let oracleParticles: THREE.Points | undefined
      const oracleObjects: THREE.Mesh[] = []

      if (kind === "lotus") {
        root.position.set(1.7, -0.05, 0)
        const petalGeometry = createPetalGeometry(lowEnd)
        resources.add(petalGeometry)
        const gold = new THREE.MeshPhysicalMaterial({ color: 0xd0a652, metalness: 0.55, roughness: 0.25, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })
        const green = new THREE.MeshPhysicalMaterial({ color: 0x345444, metalness: 0.18, roughness: 0.38, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false })
        resources.add(gold)
        resources.add(green)
        for (let index = 0; index < 10; index += 1) {
          const pivot = new THREE.Group()
          const angle = index / 10 * Math.PI * 2
          const petal = new THREE.Mesh(petalGeometry, index % 3 === 0 ? gold : green)
          petal.position.y = index % 2 === 0 ? 1.32 : 1.08
          petal.rotation.x = index % 2 === 0 ? -0.18 : 0.06
          pivot.rotation.z = angle
          pivot.userData.baseAngle = angle
          pivot.add(petal)
          root.add(pivot)
          lotusPetals.push(pivot)
        }
        const centerGeometry = new THREE.IcosahedronGeometry(0.48, 2)
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xf4dfaa, emissive: 0xc28f35, emissiveIntensity: 0.9, metalness: 0.25, roughness: 0.28 })
        resources.add(centerGeometry)
        resources.add(centerMaterial)
        lotusCenter = new THREE.Mesh(centerGeometry, centerMaterial)
        root.add(lotusCenter)
      }

      if (kind === "threshold") {
        root.position.x = 0.45
        for (let index = 0; index < 8; index += 1) {
          const geometry = new THREE.BoxGeometry(5.2 - index * 0.32, 4.2 - index * 0.24, 0.08)
          const edges = new THREE.EdgesGeometry(geometry)
          const material = new THREE.LineBasicMaterial({ color: index % 2 ? 0x806526 : 0xd0a652, transparent: true, opacity: 0.12 + index * 0.025 })
          resources.add(geometry)
          resources.add(edges)
          resources.add(material)
          const frameMesh = new THREE.LineSegments(edges, material)
          frameMesh.position.z = -index * 1.35
          root.add(frameMesh)
          thresholdFrames.push(frameMesh)
        }
        const trailGeometry = new THREE.BufferGeometry()
        const trailPositions = new Float32Array(180 * 3)
        for (let index = 0; index < 180; index += 1) {
          const z = -index * 0.075
          trailPositions[index * 3] = Math.sin(index * 0.16) * (0.15 + index * 0.001)
          trailPositions[index * 3 + 1] = -1.45 + Math.cos(index * 0.12) * 0.08
          trailPositions[index * 3 + 2] = z
        }
        trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3))
        const trailMaterial = new THREE.PointsMaterial({ color: 0xf0c766, size: 0.055, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
        resources.add(trailGeometry)
        resources.add(trailMaterial)
        root.add(new THREE.Points(trailGeometry, trailMaterial))
      }

      if (kind === "oracle") {
        root.position.x = -1.3
        const particleGeometry = new THREE.BufferGeometry()
        const count = lowEnd ? 420 : 820
        const positions = new Float32Array(count * 3)
        for (let index = 0; index < count; index += 1) {
          const progress = index / count
          const y = progress * 4.8 - 2.4
          const torsoWidth = 0.45 + Math.sin(progress * Math.PI) * 0.78 + (progress < 0.22 ? 0.38 : 0)
          const angle = index * 2.39996
          positions[index * 3] = Math.cos(angle) * torsoWidth * (0.45 + (index % 17) / 28)
          positions[index * 3 + 1] = y
          positions[index * 3 + 2] = Math.sin(angle) * 0.48
        }
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        const particleMaterial = new THREE.PointsMaterial({ color: 0xd5aa53, size: lowEnd ? 0.025 : 0.032, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
        resources.add(particleGeometry)
        resources.add(particleMaterial)
        oracleParticles = new THREE.Points(particleGeometry, particleMaterial)
        root.add(oracleParticles)

        const objectMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb99242, metalness: 0.62, roughness: 0.2, transparent: true, opacity: 0.62 })
        resources.add(objectMaterial)
        const geometries = [new THREE.IcosahedronGeometry(0.35, 2), new THREE.SphereGeometry(0.28, 24, 16), new THREE.OctahedronGeometry(0.31, 1)]
        const locations = [[-2.1, -0.8, 0.4], [1.7, 1.4, -0.2], [1.9, -1.25, 0.3]]
        geometries.forEach((geometry, index) => {
          resources.add(geometry)
          const mesh = new THREE.Mesh(geometry, objectMaterial)
          mesh.position.set(locations[index][0], locations[index][1], locations[index][2])
          mesh.userData.baseY = locations[index][1]
          root.add(mesh)
          oracleObjects.push(mesh)
        })
      }

      const key = new THREE.DirectionalLight(0xffedbd, 3.8)
      key.position.set(-3, 5, 6)
      scene.add(key)
      const rim = new THREE.PointLight(0xd29b38, 12, 11, 1.5)
      rim.position.set(3, 0, 3)
      scene.add(rim)
      scene.add(new THREE.HemisphereLight(0x70897a, 0x07100c, 1.8))

      const resize = () => {
        if (!renderer || disposed) return
        const rect = host.getBoundingClientRect()
        if (rect.width < 1 || rect.height < 1) return
        renderer.setSize(rect.width, rect.height, false)
        camera.aspect = rect.width / rect.height
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
      }
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      resize()

      const started = performance.now()
      let lastPoseTime = started
      let openness = activeRef.current ? 1 : 0
      const render = (now: number) => {
        if (disposed || !renderer || !visible) return
        if (lowEnd && now - lastFrame < 1000 / 30) {
          frame = window.requestAnimationFrame(render)
          return
        }
        lastFrame = now
        const time = (now - started) / 1000
        const delta = Math.min((now - lastPoseTime) / 1000, 0.1)
        lastPoseTime = now
        pointer.lerp(pointerTarget, 0.035)
        root.rotation.y = pointer.x * 0.08
        root.rotation.x = pointer.y * 0.035

        const opennessTarget = activeRef.current ? 1 : 0
        openness = reduceMotion ? opennessTarget : THREE.MathUtils.lerp(openness, opennessTarget, 1 - Math.exp(-delta * 6))
        lotusPetals.forEach((petal, index) => {
          const ambientTilt = reduceMotion ? 0 : Math.sin(time * 0.72 + index * 0.55) * 0.13
          const ambientTwist = reduceMotion ? 0 : Math.sin(time * 0.32 + index) * (openness ? 0.06 : 0.018)
          petal.rotation.x = -0.16 + openness * 0.52 + ambientTilt
          petal.rotation.z = petal.userData.baseAngle + ambientTwist
        })
        if (lotusCenter) lotusCenter.scale.setScalar(1 + openness * 0.28)

        if (!reduceMotion) {
          thresholdFrames.forEach((portal, index) => {
            const start = -index * 1.35
            const progress = ((start + 9.6 + time * (0.36 + index * 0.024)) % 10.8 + 10.8) % 10.8
            portal.position.z = -9.6 + progress
            portal.rotation.z = Math.sin(time * 0.2 + index) * 0.006
          })
          if (oracleParticles) {
            oracleParticles.rotation.y = Math.sin(time * 0.28) * 0.18
            oracleParticles.position.y = Math.sin(time * 0.65) * 0.06
          }
          oracleObjects.forEach((object, index) => {
            object.rotation.x = time * (0.24 + index * 0.06)
            object.rotation.y = time * (0.36 - index * 0.048)
            object.position.y = object.userData.baseY + Math.sin(time * 0.8 + index * 2) * 0.08
          })
          camera.position.x = pointer.x * 0.16
          camera.position.y = -pointer.y * 0.1
        }

        renderer.render(scene, camera)
        if (!reduceMotion) frame = window.requestAnimationFrame(render)
      }

      if (reduceMotion) {
        renderActiveRef.current = () => render(performance.now())
        cleanups.push(() => { renderActiveRef.current = null })
      }

      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible && !reduceMotion) {
          window.cancelAnimationFrame(frame)
          frame = window.requestAnimationFrame(render)
        }
      }, { rootMargin: "100px" })
      intersectionObserver.observe(host)
      host.dataset.sceneReady = "true"
      host.dataset.sceneActive = String(activeRef.current)
      frame = window.requestAnimationFrame(render)
      return dispose
    } catch {
      dispose()
      host.dataset.sceneReady = "fallback"
      return dispose
    }
  }, [kind])

  return <div ref={hostRef} className={`concept-scene concept-scene--${kind}`} aria-hidden="true"></div>
}
