// main.js — Three.js scene untuk Tugu Jogja 3D
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('scene-canvas');
const loadingEl = document.getElementById('loading');
const modelNote = document.getElementById('model-note');
const btnOrbit = document.getElementById('btn-orbit');

// ---------- RENDERER / SCENE / CAMERA ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0f14);
scene.fog = new THREE.Fog(0x0d0f14, 28, 90);

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
camera.position.set(9, 4.5, 13);

// ---------- CONTROLS ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.target.set(0, 7, 0);

// ---------- LIGHTS ----------
scene.add(new THREE.AmbientLight(0x404a66, 0.55));

const moonLight = new THREE.DirectionalLight(0x9db4ff, 1.1);
moonLight.position.set(-12, 20, 10);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.left = -25;
moonLight.shadow.camera.right = 25;
moonLight.shadow.camera.top = 25;
moonLight.shadow.camera.bottom = -25;
moonLight.shadow.camera.far = 80;
scene.add(moonLight);

const warmKey = new THREE.SpotLight(0xffd9a0, 260, 60, Math.PI / 5, 0.5, 1.6);
warmKey.position.set(8, 14, 8);
warmKey.target.position.set(0, 8, 0);
scene.add(warmKey, warmKey.target);

const upLight = new THREE.SpotLight(0xfff3d6, 180, 45, Math.PI / 6, 0.6, 1.7);
upLight.position.set(-6, 1, -6);
upLight.target.position.set(0, 12, 0);
scene.add(upLight, upLight.target);

// ---------- GROUND & PLAZA ----------
function makeGround() {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: 0x11141b, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Plaza melingkar di sekeliling tugu
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(13, 64),
    new THREE.MeshStandardMaterial({ color: 0x1e222d, roughness: 0.85 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Ring aksen emas
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(12.4, 12.8, 96),
    new THREE.MeshStandardMaterial({
      color: 0xd4a94e, roughness: 0.4, metalness: 0.7,
      emissive: 0x3a2c10, side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  scene.add(ring);

  // Lampu taman kecil di sekeliling plaza
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0x2a3040, roughness: 0.6, metalness: 0.5
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe6b0, emissive: 0xffc266, emissiveIntensity: 2.2
  });
  const lampPositions = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    lampPositions.push([Math.cos(a) * 12, Math.sin(a) * 12]);
  }
  const lampGeo = new THREE.CylinderGeometry(0.06, 0.09, 2.2, 8);
  const bulbGeo = new THREE.SphereGeometry(0.16, 12, 12);
  lampPositions.forEach(([x, z]) => {
    const post = new THREE.Mesh(lampGeo, lampMat);
    post.position.set(x, 1.1, z);
    post.castShadow = true;
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(x, 2.3, z);
    scene.add(post, bulb);
  });
  return bulbMat;
}
const bulbMat = makeGround();

// ---------- MODEL TUGU ----------
const tuguRoot = new THREE.Group();
scene.add(tuguRoot);

let tuguGroup = null;

function applyShadows(obj) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

// Fallback procedural: rekonstruksi Tugu Pal Putih (bentuk kerucut 1889)
// plus strip "golong-gilig" sebagai referensi bentuk asli.
function buildProceduralTugu() {
  const g = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xd9d5cc, roughness: 0.72, metalness: 0.04
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf3f1ec, roughness: 0.6, metalness: 0.05
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a94e, roughness: 0.35, metalness: 0.85,
    emissive: 0x2e220c
  });

  // Base / plinth bertingkat
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.5, 48), stoneMat);
  base1.position.y = 0.25;
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.9, 0.6, 48), stoneMat);
  base2.position.y = 0.8;
  const base3 = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.0, 0.8, 48), stoneMat);
  base3.position.y = 1.5;

  // Tiang utama (gilig) menyempit ke atas
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 12.5, 48), whiteMat);
  shaft.position.y = 8.15;

  // Band dekoratif
  const band1 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.22, 48), goldMat);
  band1.position.y = 3.4;
  const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.2, 48), goldMat);
  band2.position.y = 13.2;

  // Kepala tugu: cakram (golong) + puncak
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.6, 0.5, 48), whiteMat);
  cap.position.y = 14.5;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.35, 48), goldMat);
  disc.position.y = 14.95;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.1, 48), whiteMat);
  tip.position.y = 15.7;

  g.add(base1, base2, base3, shaft, band1, band2, cap, disc, tip);
  applyShadows(g);
  return g;
}

function setTugu(obj) {
  if (tuguGroup) tuguRoot.remove(tuguGroup);
  tuguGroup = obj;
  tuguRoot.add(obj);
  loadingEl.classList.add('hidden');
}

// Coba muat model GLB dari folder public (jika user menaruh file dari Sketchfab)
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'models/tugu_jogja.glb',
  (gltf) => {
    const model = gltf.scene;
    applyShadows(model);

    // Normalisasi ukuran & posisi model Sketchfab (ukuran bervariasi)
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 16 / maxDim;
      model.scale.setScalar(scale);
    }
    const box2 = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box2.min.y; // taruh di tanah

    setTugu(model);
    if (modelNote) {
      modelNote.innerHTML =
        '✅ Model Sketchfab dimuat dari <code>public/models/tugu_jogja.glb</code>';
    }
  },
  undefined,
  () => {
    // Gagal memuat → pakai model procedural
    setTugu(buildProceduralTugu());
    if (modelNote) {
      modelNote.innerHTML =
        'ℹ️ Menggunakan model procedural bawaan. Unduh GLB dari ' +
        '<a href="https://sketchfab.com/3d-models/jogja-3d-0e68f8db131b436197096dafee7a7ec6" target="_blank" rel="noopener">Sketchfab</a> ' +
        'lalu simpan sebagai <code>public/models/tugu_jogja.glb</code>.';
    }
  }
);

// ---------- INTERAKSI TAMBAHAN ----------
let autoRotate = true;
controls.autoRotate = autoRotate;
controls.autoRotateSpeed = 1.2;

btnOrbit?.addEventListener('click', () => {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  btnOrbit.textContent = autoRotate ? '🎬 Putar Otomatis' : '⏸ Hentikan Putaran';
});

// Berhenti memutar otomatis saat user mulai drag
controls.addEventListener('start', () => {
  if (autoRotate) {
    autoRotate = false;
    controls.autoRotate = false;
    btnOrbit.textContent = '🎬 Putar Otomatis';
  }
});

// Kelap-kelip lampu taman
function flicker(t) {
  bulbMat.emissiveIntensity = 1.9 + Math.sin(t * 2.1) * 0.35 + Math.sin(t * 7.3) * 0.12;
}

// ---------- ANIMATION LOOP ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  tuguRoot.position.y = Math.sin(t * 0.8) * 0.04; // bob halus
  flicker(t);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---------- RESIZE ----------
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
