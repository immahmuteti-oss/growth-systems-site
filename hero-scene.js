import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

const canvas = document.querySelector("#hero-canvas");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && hero) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.4, 17);
  const system = new THREE.Group();
  scene.add(system);

  const mint = new THREE.Color("#bce5d1");
  const rust = new THREE.Color("#d25b40");
  const soft = new THREE.Color("#f3f6f2");

  function route(offset, color, phase) {
    const points = [];
    for (let index = 0; index <= 48; index += 1) {
      const x = -10 + index * (20 / 48);
      const y = offset + Math.sin(index * 0.26 + phase) * 0.72 + Math.cos(index * 0.11 + phase) * 0.26;
      const z = Math.cos(index * 0.21 + phase) * 1.4 - 1;
      points.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 });
    system.add(new THREE.Line(geometry, material));
  }

  [-3.2, -2, -0.8, 0.55, 1.8, 3.1].forEach((offset, index) => route(offset, index === 2 ? rust : mint, index * 0.64));

  const gridGeometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let line = -8; line <= 8; line += 2) {
    vertices.push(-9, line * 0.42, -3, 9, line * 0.42, -3);
  }
  for (let line = -8; line <= 8; line += 2) {
    vertices.push(line, -3.8, -3, line, 3.8, -3);
  }
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const grid = new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({ color: soft, transparent: true, opacity: 0.15 }));
  system.add(grid);

  const frames = new THREE.Group();
  [-4.8, 0, 4.8].forEach((x, index) => {
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4, 2.4, 2.4)), new THREE.LineBasicMaterial({ color: index === 1 ? rust : mint, transparent: true, opacity: 0.42 }));
    frame.position.set(x, index === 1 ? 0.7 : -0.7, -1.5 - index * 0.25);
    frame.rotation.set(index * 0.2, index * -0.35, index * 0.12);
    frames.add(frame);
  });
  system.add(frames);

  const pointer = { x: 0, y: 0 };
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  function resize() {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(time = 0) {
    const elapsed = time * 0.001;
    if (!reducedMotion) {
      system.rotation.y += (pointer.x * 0.18 - system.rotation.y) * 0.025;
      system.rotation.x += (-pointer.y * 0.08 - system.rotation.x) * 0.025;
      frames.rotation.y = elapsed * 0.075;
      frames.rotation.z = Math.sin(elapsed * 0.22) * 0.08;
    }
    renderer.render(scene, camera);
    if (!reducedMotion) window.requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  render();
}
