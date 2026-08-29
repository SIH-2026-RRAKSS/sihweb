import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PlanetaryHeroCanvasProps {
  scrollProgress?: number;
}

// Major hubs across Indian and global financial corridors
const NETWORK_HUBS = [
  { name: 'Mumbai Hub', lat: 19.0760, lon: 72.8777, color: '#EA580C' },
  { name: 'Bengaluru Node', lat: 12.9716, lon: 77.5946, color: '#059669' },
  { name: 'Delhi Core', lat: 28.6139, lon: 77.2090, color: '#2563EB' },
  { name: 'Kolkata Node', lat: 22.5726, lon: 88.3639, color: '#DC2626' },
  { name: 'Bhopal Switch', lat: 23.2599, lon: 77.4126, color: '#D97706' },
  { name: 'Singapore Gateway', lat: 1.3521, lon: 103.8198, color: '#2563EB' },
  { name: 'London Node', lat: 51.5074, lon: -0.1278, color: '#0D9488' },
  { name: 'Dubai Corridor', lat: 25.2048, lon: 55.2708, color: '#D97706' },
];

const HOP_CONNECTIONS = [
  { from: 2, to: 0, color: '#EA580C' }, // Delhi -> Mumbai
  { from: 0, to: 1, color: '#059669' }, // Mumbai -> Bengaluru
  { from: 3, to: 4, color: '#D97706' }, // Kolkata -> Bhopal
  { from: 4, to: 0, color: '#EA580C' }, // Bhopal -> Mumbai
  { from: 0, to: 5, color: '#2563EB' }, // Mumbai -> Singapore
  { from: 0, to: 7, color: '#D97706' }, // Mumbai -> Dubai
  { from: 7, to: 6, color: '#0D9488' }, // Dubai -> London
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const PlanetaryHeroCanvas: React.FC<PlanetaryHeroCanvasProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.0015);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 4, 38);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting System (Optimized for Crisp White Theme Contrast)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(45, 30, 40);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-50, 20, -35);
    scene.add(rimLight);

    const orangeFill = new THREE.PointLight(0xff6b00, 1.6, 80);
    orangeFill.position.set(20, -25, 30);
    scene.add(orangeFill);

    // 5. Earth Sphere Group
    const earthRadius = 11.5;
    const planetGroup = new THREE.Group();
    planetGroup.rotation.x = 0.28;
    planetGroup.rotation.y = 3.65;
    scene.add(planetGroup);

    // NASA Earth Textures
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const earthMapUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg';
    const earthCloudsUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png';
    const earthNormalUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_normal_2048.jpg';
    const earthSpecUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_specular_2048.jpg';

    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.05,
    });

    textureLoader.load(earthMapUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    });

    textureLoader.load(earthNormalUrl, (tex) => {
      earthMat.normalMap = tex;
      earthMat.normalScale = new THREE.Vector2(0.85, 0.85);
      earthMat.needsUpdate = true;
    });

    textureLoader.load(earthSpecUrl, (tex) => {
      earthMat.roughnessMap = tex;
      earthMat.needsUpdate = true;
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    planetGroup.add(earthMesh);

    // Cloud Layer
    const cloudsMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    textureLoader.load(earthCloudsUrl, (tex) => {
      cloudsMat.map = tex;
      cloudsMat.needsUpdate = true;
    });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(earthRadius + 0.08, 48, 48), cloudsMat);
    planetGroup.add(cloudsMesh);

    // Atmospheric Fresnel Rim Shader
    const atmoGeo = new THREE.SphereGeometry(earthRadius + 0.32, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(0.14, 0.65, 0.95, 1.0) * intensity * 1.4;
        }
      `,
      blending: THREE.NormalBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmoMesh);

    // ── 6. PINS & RADAR PULSES (HIGH CONTRAST) ──
    const hubMarkers: { mesh: THREE.Mesh; ring: THREE.Mesh; pos: THREE.Vector3 }[] = [];

    NETWORK_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, earthRadius + 0.04);

      const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hub.color) });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      planetGroup.add(markerMesh);

      const ringGeo = new THREE.RingGeometry(0.16, 0.34, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(hub.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(planetGroup.position);
      planetGroup.add(ringMesh);

      hubMarkers.push({ mesh: markerMesh, ring: ringMesh, pos });
    });

    // ── 7. HOPPING ENERGY ARCS & PHOTON PACKETS ──
    interface HopArc {
      curve: THREE.QuadraticBezierCurve3;
      line: THREE.Line;
      particles: THREE.Points;
      progress: number;
      speed: number;
    }

    const hopArcs: HopArc[] = [];

    HOP_CONNECTIONS.forEach((conn, idx) => {
      const fromPos = hubMarkers[conn.from].pos;
      const toPos = hubMarkers[conn.to].pos;

      const midPoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
      const distance = fromPos.distanceTo(toPos);
      midPoint.normalize().multiplyScalar(earthRadius + Math.max(1.1, distance * 0.42));

      const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
      const curvePoints = curve.getPoints(45);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      
      const curveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(conn.color),
        transparent: true,
        opacity: 0.75,
        linewidth: 2,
      });
      const line = new THREE.Line(curveGeo, curveMat);
      planetGroup.add(line);

      // Hopping Photon packet
      const particleGeo = new THREE.BufferGeometry();
      const pCount = 3;
      const pPositions = new Float32Array(pCount * 3);
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: new THREE.Color(conn.color),
        size: 0.32,
        transparent: true,
        opacity: 1.0,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      planetGroup.add(particles);

      hopArcs.push({
        curve,
        line,
        particles,
        progress: (idx * 0.22) % 1.0,
        speed: 0.4 + (idx % 3) * 0.12,
      });
    });

    // ── 8. SUBTLE PARTICLES ──
    const starCount = 180;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 100;
      starPos[i + 1] = (Math.random() - 0.5) * 100;
      starPos[i + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.12, transparent: true, opacity: 0.35 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 9. SMOOTH CINEMATIC AUTO-ROTATION ──
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const targetRotY = 3.65 + Math.sin(time * 0.35) * 0.42;
      const targetRotX = 0.28 + Math.sin(time * 0.25) * 0.06;
      
      planetGroup.rotation.y += (targetRotY - planetGroup.rotation.y) * 0.025;
      planetGroup.rotation.x += (targetRotX - planetGroup.rotation.x) * 0.025;
      cloudsMesh.rotation.y += 0.0005;

      // Pulse Radar Rings
      hubMarkers.forEach((hub, idx) => {
        const pulse = 1.0 + Math.sin(time * 3.5 + idx) * 0.3;
        hub.ring.scale.set(pulse, pulse, pulse);
        (hub.ring.material as THREE.MeshBasicMaterial).opacity = 0.9 - (pulse - 1.0) * 0.7;
      });

      // Animate Hopping Photons
      hopArcs.forEach((arc) => {
        arc.progress = (arc.progress + delta * arc.speed) % 1.0;
        
        const posAttr = arc.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let p = 0; p < 3; p++) {
          const t = Math.max(0, Math.min(1, arc.progress - p * 0.035));
          const pPoint = arc.curve.getPoint(t);
          positions[p * 3] = pPoint.x;
          positions[p * 3 + 1] = pPoint.y;
          positions[p * 3 + 2] = pPoint.z;
        }
        posAttr.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
