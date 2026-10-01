'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE}
void main(){
  float n = snoise(normal * 1.35 + vec3(uTime * 0.18));
  float n2 = snoise(normal * 2.6 - vec3(uTime * 0.12)) * 0.35;
  float d = (n + n2) * uAmp;
  vNoise = n;
  vec3 pos = position + normal * d;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main(){
  vec3 blue     = vec3(0.231, 0.388, 0.878);
  vec3 lavender = vec3(0.706, 0.647, 0.933);
  vec3 sky      = vec3(0.624, 0.796, 0.949);
  vec3 sage     = vec3(0.561, 0.749, 0.624);
  vec3 ivory    = vec3(0.980, 0.973, 0.957);

  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  float t = vNormal.y * 0.5 + 0.5;
  float swirl = sin(vNormal.x * 3.0 + vNoise * 2.2 + uTime * 0.35) * 0.5 + 0.5;

  vec3 base = mix(blue, lavender, t);
  base = mix(base, sage, smoothstep(0.35, 1.0, swirl) * (1.0 - t) * 0.85);
  base = mix(base, sky, smoothstep(0.55, 1.0, vNoise * 0.5 + 0.5) * 0.45);

  vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
  float diff = max(dot(vNormal, L), 0.0);
  float spec = pow(max(dot(reflect(-L, vNormal), vView), 0.0), 28.0);

  vec3 col = base * (0.62 + diff * 0.45);
  col = mix(col, ivory, fres * 0.75);
  col += spec * 0.35;

  float alpha = mix(0.94, 0.55, fres);
  gl_FragColor = vec4(col, alpha);
}
`

function makeHalo() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(159,203,242,0.55)')
  g.addColorStop(0.45, 'rgba(180,165,238,0.25)')
  g.addColorStop(1, 'rgba(250,248,244,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

export default function HeroOrb({ className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isSmall = window.matchMedia('(max-width: 767px)').matches

    let W = mount.clientWidth || 1
    let H = mount.clientHeight || 1

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2))
    renderer.setSize(W, H)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50)
    camera.position.z = 6

    const haloTex = makeHalo()
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false }))
    halo.scale.set(7.2, 7.2, 1)
    halo.position.z = -1.2
    scene.add(halo)

    const geo = new THREE.IcosahedronGeometry(1.55, isSmall ? 18 : 32)
    const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.16 } }
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
    })
    const orb = new THREE.Mesh(geo, mat)
    scene.add(orb)

    const ringGeo = new THREE.TorusGeometry(2.25, 0.008, 8, 160)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b63e0, transparent: true, opacity: 0.22 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI * 0.42
    scene.add(ring)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.006, 8, 160),
      new THREE.MeshBasicMaterial({ color: 0x4f8a6a, transparent: true, opacity: 0.16 }))
    ring2.rotation.set(Math.PI * 0.58, Math.PI * 0.12, 0)
    scene.add(ring2)

    const mouse = { x: 0, y: 0 }
    const rot = { x: 0, y: 0 }
    function onMove(e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const scroller = document.querySelector('main')
    const section = mount.closest('section')
    let visible = true
    function checkVisible() {
      if (!scroller || !section) { visible = true; return }
      visible = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 1.05
    }
    scroller?.addEventListener('scroll', checkVisible, { passive: true })

    const timer = new THREE.Timer()
    let raf = 0
    function render() {
      timer.update(performance.now())
      const t = timer.getElapsed()
      uniforms.uTime.value = reduced ? 0 : t
      rot.x += (mouse.y * 0.25 - rot.x) * 0.04
      rot.y += (mouse.x * 0.35 - rot.y) * 0.04
      orb.rotation.x = rot.x + (reduced ? 0 : t * 0.05)
      orb.rotation.y = rot.y + (reduced ? 0 : t * 0.08)
      ring.rotation.z = reduced ? 0 : t * 0.06
      ring2.rotation.z = reduced ? 0 : -t * 0.045
      orb.position.y = reduced ? 0 : Math.sin(t * 0.6) * 0.08
      renderer.render(scene, camera)
    }
    function tick() {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      render()
    }
    if (reduced) render()
    else tick()

    const ro = new ResizeObserver(() => {
      W = mount.clientWidth || 1
      H = mount.clientHeight || 1
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
      if (reduced) render()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      scroller?.removeEventListener('scroll', checkVisible)
      geo.dispose(); mat.dispose()
      ringGeo.dispose(); ringMat.dispose()
      ring2.geometry.dispose(); ring2.material.dispose()
      haloTex.dispose(); halo.material.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={className} aria-hidden />
}
