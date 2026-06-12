'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = '/3d/frogface/frogface-present.glb';

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

export function FrogfaceViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let model: THREE.Object3D | null = null;
    let frame = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161a16);
    scene.fog = new THREE.Fog(0x161a16, 4, 8);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 1.55, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 6.5;
    controls.target.set(0, 1.35, 0);

    const key = new THREE.DirectionalLight(0xffedc2, 3.2);
    key.position.set(2.4, 4.2, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new THREE.HemisphereLight(0xb8d8ff, 0x26371f, 1.8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xb6ff3a, 1.4);
    rim.position.set(-3, 2.4, -2);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 80),
      new THREE.MeshStandardMaterial({
        color: 0x273325,
        roughness: 0.9,
        metalness: 0,
      }),
    );
    floor.name = 'preview_swamp_floor';
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }

        model = gltf.scene;
        model.name = 'frogface_present_preview';
        model.position.y = 0.02;
        model.traverse((child) => {
          child.castShadow = true;
          child.receiveShadow = true;
        });
        scene.add(model);
        setStatus('present rig v0.1');
      },
      undefined,
      () => setStatus('load failed'),
    );

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(1, height);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(safeWidth, safeHeight, false);
    };

    const animate = () => {
      controls.update();
      if (model) model.rotation.y += 0.0022;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
      controls.dispose();
      if (model) disposeObject(model);
      floor.geometry.dispose();
      if (Array.isArray(floor.material)) floor.material.forEach((item) => item.dispose());
      else floor.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-[#161a16] text-[#f4f4f0]">
      <div ref={hostRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <a
          href="/"
          className="pointer-events-auto rounded-full border border-[#f4f4f0]/15 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f4f4f0]/80 backdrop-blur transition-colors hover:text-[#e9c46a]"
        >
          back
        </a>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e9c46a]">frogface 3d</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f4f4f0]/55">{status}</p>
        </div>
      </div>
    </section>
  );
}
