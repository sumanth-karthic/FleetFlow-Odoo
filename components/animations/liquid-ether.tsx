'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

interface LiquidEtherProps {
    colors?: string[]
    mouseForce?: number
    cursorSize?: number
    isViscous?: boolean
    viscous?: number
    iterationsViscous?: number
    iterationsPoisson?: number
    dt?: number
    BFECC?: boolean
    resolution?: number
    isBounce?: boolean
    autoDemo?: boolean
    autoSpeed?: number
    autoIntensity?: number
    takeoverDuration?: number
    autoResumeDelay?: number
    autoRampDuration?: number
    // Included from user snippet although likely redundant with colors array
    color0?: string
    color1?: string
    color2?: string
}

const FACE_VERT = `
  precision highp float;
  attribute vec3 position;
  uniform vec2 boundarySpace;
  varying vec2 vUv;
  void main(){
    vec3 pos = position;
    vec2 scale = 1.0 - boundarySpace * 2.0;
    pos.xy = pos.xy * scale;
    vUv = vec2(0.5) + (pos.xy) * 0.5;
    gl_Position = vec4(pos, 1.0);
  }
`

const LINE_VERT = `
  precision highp float;
  attribute vec3 position;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec3 pos = position;
    vUv = 0.5 + pos.xy * 0.5;
    vec2 n = sign(pos.xy);
    pos.xy = abs(pos.xy) - px * 1.0;
    pos.xy *= n;
    gl_Position = vec4(pos, 1.0);
  }
`

const MOUSE_VERT = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`

const ADVECTION_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform bool isBFECC;
  uniform vec2 fboSize;
  varying vec2 vUv;
  void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(!isBFECC){
      vec2 vel = texture2D(velocity, vUv).xy;
      vec2 uv2 = vUv - vel * dt * ratio;
      gl_FragColor = vec4(texture2D(velocity, uv2).xy, 0.0, 0.0);
    } else {
      vec2 vel_old = texture2D(velocity, vUv).xy;
      vec2 spot_old = vUv - vel_old * dt * ratio;
      vec2 vel_new1 = texture2D(velocity, spot_old).xy;
      vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
      vec2 error = spot_new2 - vUv;
      vec2 spot_new3 = vUv - error / 2.0;
      vec2 vel_2 = texture2D(velocity, spot_new3).xy;
      vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
      gl_FragColor = vec4(texture2D(velocity, spot_old2).xy, 0.0, 0.0);
    }
  }
`

const COLOR_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D palette;
  uniform vec4 bgColor;
  varying vec2 vUv;
  void main(){
    vec2 vel = texture2D(velocity, vUv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    gl_FragColor = vec4(mix(bgColor.rgb, c, lenv), mix(bgColor.a, 1.0, lenv));
  }
`

const DIVERGENCE_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    float x0 = texture2D(velocity, vUv - vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, vUv + vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, vUv - vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, vUv + vec2(0.0, px.y)).y;
    gl_FragColor = vec4((x1 - x0 + y1 - y0) / 2.0 / dt);
  }
`

const EXTERNAL_FORCE_FRAG = `
  precision highp float;
  uniform vec2 force;
  varying vec2 vUv;
  void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    gl_FragColor = vec4(force * d * d, 0.0, 1.0);
  }
`

const POISSON_FRAG = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    float p0 = texture2D(pressure, vUv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, vUv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, vUv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, vUv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, vUv).r;
    gl_FragColor = vec4((p0 + p1 + p2 + p3) / 4.0 - div);
  }
`

const PRESSURE_FRAG = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform vec2 px;
  uniform float dt;
  varying vec2 vUv;
  void main(){
    float p0 = texture2D(pressure, vUv + vec2(px.x, 0.0)).r;
    float p1 = texture2D(pressure, vUv - vec2(px.x, 0.0)).r;
    float p2 = texture2D(pressure, vUv + vec2(0.0, px.y)).r;
    float p3 = texture2D(pressure, vUv - vec2(0.0, px.y)).r;
    vec2 v = texture2D(velocity, vUv).xy;
    gl_FragColor = vec4(v - vec2(p0 - p1, p2 - p3) * 0.5 * dt, 0.0, 1.0);
  }
`

const VISCOUS_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D velocity_new;
  uniform float v;
  uniform vec2 px;
  uniform float dt;
  varying vec2 vUv;
  void main(){
    vec2 old = texture2D(velocity, vUv).xy;
    vec2 new0 = texture2D(velocity_new, vUv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, vUv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, vUv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, vUv - vec2(0.0, px.y * 2.0)).xy;
    vec2 res = (4.0 * old + v * dt * (new0 + new1 + new2 + new3)) / (4.0 * (1.0 + v * dt));
    gl_FragColor = vec4(res, 0.0, 0.0);
  }
`

export function LiquidEther({
    colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
    mouseForce = 20,
    cursorSize = 100,
    isViscous = false,
    viscous = 30,
    iterationsViscous = 32,
    iterationsPoisson = 32,
    dt = 0.014,
    BFECC = true,
    resolution = 0.5,
    isBounce = false,
    autoDemo = false,
    autoSpeed = 0.5,
    autoIntensity = 2.2,
    takeoverDuration = 0.25,
    autoResumeDelay = 3000,
    autoRampDuration = 0.6,
    color0,
    color1,
    color2
}: LiquidEtherProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const finalColors = useMemo(() => {
        if (color0 && color1 && color2) return [color0, color1, color2]
        return colors
    }, [colors, color0, color1, color2])

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const scene = new THREE.Scene()
        const camera = new THREE.Camera()
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        const clock = new THREE.Clock()

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(container.clientWidth, container.clientHeight)
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        container.appendChild(renderer.domElement)

        // FBO Setup
        const getFloatType = () => {
            const isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent)
            return isIOS ? THREE.HalfFloatType : THREE.FloatType
        }

        const createFBO = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, {
            type: getFloatType(),
            depthBuffer: false,
            stencilBuffer: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        })

        let w = Math.round(container.clientWidth * resolution)
        let h = Math.round(container.clientHeight * resolution)
        const px = new THREE.Vector2(1 / w, 1 / h)

        const fbos = {
            vel0: createFBO(w, h),
            vel1: createFBO(w, h),
            viscous0: createFBO(w, h),
            viscous1: createFBO(w, h),
            div: createFBO(w, h),
            pressure0: createFBO(w, h),
            pressure1: createFBO(w, h)
        }

        // Palette
        const paletteData = new Uint8Array(finalColors.length * 4)
        finalColors.forEach((hex, i) => {
            const c = new THREE.Color(hex)
            paletteData[i * 4] = c.r * 255
            paletteData[i * 4 + 1] = c.g * 255
            paletteData[i * 4 + 2] = c.b * 255
            paletteData[i * 4 + 3] = 255
        })
        const paletteTex = new THREE.DataTexture(paletteData, finalColors.length, 1, THREE.RGBAFormat)
        paletteTex.needsUpdate = true

        // Shader Materials
        const advectionMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: ADVECTION_FRAG,
            uniforms: {
                boundarySpace: { value: px },
                px: { value: px },
                fboSize: { value: new THREE.Vector2(w, h) },
                velocity: { value: fbos.vel0.texture },
                dt: { value: dt },
                isBFECC: { value: BFECC }
            }
        })

        const forceMat = new THREE.RawShaderMaterial({
            vertexShader: MOUSE_VERT,
            fragmentShader: EXTERNAL_FORCE_FRAG,
            blending: THREE.AdditiveBlending,
            uniforms: {
                px: { value: px },
                force: { value: new THREE.Vector2() },
                center: { value: new THREE.Vector2() },
                scale: { value: new THREE.Vector2(cursorSize, cursorSize) }
            }
        })

        const viscousMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: VISCOUS_FRAG,
            uniforms: {
                boundarySpace: { value: px },
                velocity: { value: fbos.vel1.texture },
                velocity_new: { value: fbos.viscous0.texture },
                v: { value: viscous },
                px: { value: px },
                dt: { value: dt }
            }
        })

        const divergenceMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: DIVERGENCE_FRAG,
            uniforms: {
                boundarySpace: { value: px },
                velocity: { value: fbos.vel1.texture },
                px: { value: px },
                dt: { value: dt }
            }
        })

        const poissonMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: POISSON_FRAG,
            uniforms: {
                boundarySpace: { value: px },
                pressure: { value: fbos.pressure0.texture },
                divergence: { value: fbos.div.texture },
                px: { value: px }
            }
        })

        const pressureMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: PRESSURE_FRAG,
            uniforms: {
                boundarySpace: { value: px },
                pressure: { value: fbos.pressure0.texture },
                velocity: { value: fbos.viscous0.texture },
                px: { value: px },
                dt: { value: dt }
            }
        })

        const colorMat = new THREE.RawShaderMaterial({
            vertexShader: FACE_VERT,
            fragmentShader: COLOR_FRAG,
            transparent: true,
            uniforms: {
                velocity: { value: fbos.vel0.texture },
                boundarySpace: { value: new THREE.Vector2() },
                palette: { value: paletteTex },
                bgColor: { value: new THREE.Vector4(0, 0, 0, 0) }
            }
        })

        const plane = new THREE.PlaneGeometry(2, 2)
        const screenQuad = new THREE.Mesh(plane)

        // Mouse Interaction
        const mouse = new THREE.Vector2()
        const prevMouse = new THREE.Vector2()
        const mouseDiff = new THREE.Vector2()
        let lastInteract = 0
        let autoTarget = new THREE.Vector2()
        let autoCurrent = new THREE.Vector2()

        const onMove = (e: MouseEvent | TouchEvent) => {
            const x = 'clientX' in e ? e.clientX : e.touches[0].clientX
            const y = 'clientY' in e ? e.clientY : e.touches[0].clientY
            const rect = container.getBoundingClientRect()
            mouse.set(((x - rect.left) / rect.width) * 2 - 1, -(((y - rect.top) / rect.height) * 2 - 1))
            lastInteract = performance.now()
        }

        container.addEventListener('mousemove', onMove)
        container.addEventListener('touchstart', onMove, { passive: true })
        container.addEventListener('touchmove', onMove, { passive: true })

        const updateSimulation = () => {
            const now = performance.now()
            const isIdle = now - lastInteract > autoResumeDelay

            if (autoDemo && isIdle) {
                if (now % 2000 < 16) {
                    autoTarget.set(Math.random() * 2 - 1, Math.random() * 2 - 1)
                }
                autoCurrent.lerp(autoTarget, 0.05)
                mouse.copy(autoCurrent)
            }

            mouseDiff.subVectors(mouse, prevMouse)
            prevMouse.copy(mouse)

            // 1. Advection
            advectionMat.uniforms.velocity.value = fbos.vel0.texture
            renderer.setRenderTarget(fbos.vel1)
            screenQuad.material = advectionMat
            renderer.render(scene, camera)

            // 2. External Force
            if (mouseDiff.length() > 0 || (autoDemo && isIdle)) {
                forceMat.uniforms.force.value.copy(mouseDiff).multiplyScalar(mouseForce)
                forceMat.uniforms.center.value.copy(mouse)
                renderer.autoClear = false
                renderer.setRenderTarget(fbos.vel1)
                screenQuad.material = forceMat
                renderer.render(scene, camera)
            }

            // 3. Viscosity
            let currentVel = fbos.vel1
            if (isViscous) {
                for (let i = 0; i < iterationsViscous; i++) {
                    const src = i % 2 === 0 ? currentVel : fbos.viscous1
                    const dst = i % 2 === 0 ? fbos.viscous1 : fbos.viscous0
                    viscousMat.uniforms.velocity_new.value = src.texture
                    renderer.setRenderTarget(dst)
                    screenQuad.material = viscousMat
                    renderer.render(scene, camera)
                    if (i === iterationsViscous - 1) currentVel = dst
                }
            }

            // 4. Divergence
            divergenceMat.uniforms.velocity.value = currentVel.texture
            renderer.setRenderTarget(fbos.div)
            screenQuad.material = divergenceMat
            renderer.render(scene, camera)

            // 5. Poisson (Pressure)
            for (let i = 0; i < iterationsPoisson; i++) {
                const src = i % 2 === 0 ? fbos.pressure0 : fbos.pressure1
                const dst = i % 2 === 0 ? fbos.pressure1 : fbos.pressure0
                poissonMat.uniforms.pressure.value = src.texture
                renderer.setRenderTarget(dst)
                screenQuad.material = poissonMat
                renderer.render(scene, camera)
            }

            // 6. Pressure Projection
            pressureMat.uniforms.pressure.value = fbos.pressure0.texture
            pressureMat.uniforms.velocity.value = currentVel.texture
            renderer.setRenderTarget(fbos.vel0)
            screenQuad.material = pressureMat
            renderer.render(scene, camera)

            // 7. Render Output
            colorMat.uniforms.velocity.value = fbos.vel0.texture
            renderer.setRenderTarget(null)
            screenQuad.material = colorMat
            renderer.render(scene, camera)
        }

        let rafId: number
        const animate = () => {
            updateSimulation()
            rafId = requestAnimationFrame(animate)
        }
        animate()

        const handleResize = () => {
            w = Math.round(container.clientWidth * resolution)
            h = Math.round(container.clientHeight * resolution)
            px.set(1 / w, 1 / h)
            renderer.setSize(container.clientWidth, container.clientHeight)
            Object.values(fbos).forEach(fbo => fbo.setSize(w, h))
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            container.removeEventListener('mousemove', onMove)
            container.removeEventListener('touchstart', onMove)
            container.removeEventListener('touchmove', onMove)
            cancelAnimationFrame(rafId)
            renderer.dispose()
            Object.values(fbos).forEach(fbo => fbo.dispose())
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
        }
    }, [finalColors, mouseForce, cursorSize, isViscous, viscous, iterationsViscous, iterationsPoisson, dt, BFECC, resolution, autoDemo, autoResumeDelay])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]"
        />
    )
}
