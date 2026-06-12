import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const OUT_DIR = path.resolve('public/3d/frogface');

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class NodeFileReader {
    result = null;
    onloadend = null;

    async readAsArrayBuffer(blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  };
}

const materials = {
  skin: new THREE.MeshStandardMaterial({
    name: 'frogface_olive_skin',
    color: 0x6b7a3f,
    roughness: 0.82,
    metalness: 0.02,
  }),
  skinLight: new THREE.MeshStandardMaterial({
    name: 'frogface_sage_highlight',
    color: 0x8c9a6b,
    roughness: 0.86,
  }),
  belly: new THREE.MeshStandardMaterial({
    name: 'frogface_warm_belly',
    color: 0xd4b886,
    roughness: 0.9,
  }),
  spot: new THREE.MeshStandardMaterial({
    name: 'frogface_dark_spots',
    color: 0x455126,
    roughness: 0.92,
  }),
  eyeWhite: new THREE.MeshStandardMaterial({
    name: 'frogface_warm_eye_white',
    color: 0xf2dfb5,
    roughness: 0.45,
  }),
  iris: new THREE.MeshStandardMaterial({
    name: 'frogface_amber_iris',
    color: 0x8b531e,
    roughness: 0.35,
  }),
  pupil: new THREE.MeshStandardMaterial({
    name: 'frogface_black_pupil',
    color: 0x0b0907,
    roughness: 0.22,
  }),
  boxer: new THREE.MeshStandardMaterial({
    name: 'frogface_base_boxer_shorts',
    color: 0x343434,
    roughness: 0.75,
  }),
  jeans: new THREE.MeshStandardMaterial({
    name: 'frogface_present_grey_jeans',
    color: 0x6e6e6e,
    roughness: 0.84,
  }),
  seam: new THREE.MeshStandardMaterial({
    name: 'frogface_jeans_dark_seams',
    color: 0x363636,
    roughness: 0.88,
  }),
  gold: new THREE.MeshStandardMaterial({
    name: 'frogface_necklace_warm_gold',
    color: 0xe9c46a,
    roughness: 0.42,
    metalness: 0.55,
  }),
  mouth: new THREE.MeshStandardMaterial({
    name: 'frogface_mouth_line',
    color: 0x2f2f2f,
    roughness: 0.8,
  }),
};

const sphere = new THREE.SphereGeometry(1, 32, 18);
const spotSphere = new THREE.SphereGeometry(1, 16, 8);
const capsule = (radius, length) => new THREE.CapsuleGeometry(radius, length, 8, 18);

function mesh(name, geometry, material, position, scale, rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, material);
  item.name = name;
  item.position.set(...position);
  item.scale.set(...scale);
  item.rotation.set(...rotation);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function addSpot(parent, name, position, scale, rotation = [0, 0, 0]) {
  parent.add(mesh(name, spotSphere, materials.spot, position, scale, rotation));
}

function addFinger(parent, side, index, x, z, rotZ) {
  const finger = mesh(
    `base_${side}_finger_${index}`,
    capsule(0.025, 0.16),
    materials.skin,
    [x, 0.72 - index * 0.015, z],
    [1, 1, 1],
    [Math.PI / 2, 0, rotZ],
  );
  parent.add(finger);
}

function createBaseGroup() {
  const base = new THREE.Group();
  base.name = 'Frogface_Base';
  base.userData = {
    role: 'rig_master_base',
    outfit: 'boxer_shorts',
    source: 'refs/character/base-v3-neutral.png',
  };

  base.add(mesh('base_round_torso', sphere, materials.skin, [0, 1.48, 0], [0.55, 0.78, 0.36]));
  base.add(mesh('base_belly_patch', sphere, materials.belly, [0, 1.45, 0.31], [0.4, 0.52, 0.08]));
  base.add(mesh('base_head', sphere, materials.skin, [0, 2.35, 0.02], [0.68, 0.46, 0.48]));
  base.add(mesh('base_mouth_patch', sphere, materials.belly, [0, 2.22, 0.43], [0.48, 0.14, 0.1]));
  base.add(mesh('base_mouth_line', new THREE.BoxGeometry(0.62, 0.018, 0.018), materials.mouth, [0, 2.25, 0.525], [1, 1, 1]));

  for (const side of [-1, 1]) {
    const label = side < 0 ? 'left' : 'right';
    base.add(mesh(`base_${label}_eye_bulge`, sphere, materials.skinLight, [side * 0.36, 2.62, 0.22], [0.25, 0.22, 0.19]));
    base.add(mesh(`base_${label}_eye_white`, sphere, materials.eyeWhite, [side * 0.36, 2.58, 0.36], [0.17, 0.15, 0.05]));
    base.add(mesh(`base_${label}_iris`, sphere, materials.iris, [side * 0.36, 2.57, 0.405], [0.085, 0.085, 0.025]));
    base.add(mesh(`base_${label}_pupil`, sphere, materials.pupil, [side * 0.36, 2.57, 0.43], [0.04, 0.04, 0.012]));

    base.add(mesh(`base_${label}_upper_arm`, capsule(0.11, 0.54), materials.skin, [side * 0.68, 1.55, 0.03], [1, 1, 1], [0.02, 0, side * 0.18]));
    base.add(mesh(`base_${label}_forearm`, capsule(0.1, 0.42), materials.skin, [side * 0.76, 1.02, 0.02], [1, 1, 1], [0, 0, side * -0.08]));
    base.add(mesh(`base_${label}_palm`, sphere, materials.skin, [side * 0.78, 0.69, 0.04], [0.13, 0.1, 0.08]));
    addFinger(base, label, 0, side * 0.68, 0.08, side * 0.8);
    addFinger(base, label, 1, side * 0.76, 0.12, side * 0.25);
    addFinger(base, label, 2, side * 0.84, 0.08, side * -0.45);

    base.add(mesh(`base_${label}_thigh`, capsule(0.13, 0.42), materials.skin, [side * 0.23, 0.74, 0], [1, 1, 1]));
    base.add(mesh(`base_${label}_shin`, capsule(0.115, 0.46), materials.skin, [side * 0.24, 0.34, 0.02], [1, 1, 1]));
    base.add(mesh(`base_${label}_foot`, sphere, materials.skin, [side * 0.28, 0.08, 0.18], [0.24, 0.07, 0.18]));
  }

  base.add(mesh('base_boxer_waist', new THREE.CylinderGeometry(0.46, 0.5, 0.24, 32), materials.boxer, [0, 0.96, 0], [1, 1, 0.72]));
  base.add(mesh('base_boxer_left_leg', new THREE.CylinderGeometry(0.16, 0.17, 0.24, 24), materials.boxer, [-0.2, 0.8, 0.02], [1, 1, 0.9]));
  base.add(mesh('base_boxer_right_leg', new THREE.CylinderGeometry(0.16, 0.17, 0.24, 24), materials.boxer, [0.2, 0.8, 0.02], [1, 1, 0.9]));

  [
    ['base_spot_head_front_01', [-0.18, 2.73, 0.42], [0.045, 0.03, 0.012]],
    ['base_spot_head_front_02', [0.12, 2.75, 0.41], [0.035, 0.026, 0.012]],
    ['base_spot_head_front_03', [0.29, 2.42, 0.43], [0.04, 0.03, 0.012]],
    ['base_spot_torso_left', [-0.34, 1.78, 0.28], [0.05, 0.038, 0.014]],
    ['base_spot_torso_right', [0.33, 1.63, 0.28], [0.04, 0.032, 0.014]],
    ['base_spot_back_01', [-0.2, 1.85, -0.31], [0.055, 0.04, 0.014]],
    ['base_spot_back_02', [0.18, 2.32, -0.38], [0.045, 0.035, 0.014]],
    ['base_spot_left_arm', [-0.73, 1.31, 0.16], [0.035, 0.028, 0.012]],
    ['base_spot_right_arm', [0.74, 1.22, 0.15], [0.035, 0.028, 0.012]],
    ['base_spot_left_leg', [-0.28, 0.47, 0.14], [0.035, 0.028, 0.012]],
    ['base_spot_right_leg', [0.27, 0.41, 0.14], [0.04, 0.03, 0.012]],
  ].forEach(([name, position, scale]) => addSpot(base, name, position, scale));

  return base;
}

function createPresentOutfitGroup() {
  const outfit = new THREE.Group();
  outfit.name = 'Frogface_Outfit_Present';
  outfit.userData = {
    role: 'toggleable_present_day_outfit',
    clothing: 'grey_jeans',
  };

  outfit.add(mesh('present_jeans_waist', new THREE.CylinderGeometry(0.48, 0.5, 0.28, 32), materials.jeans, [0, 0.96, 0], [1, 1, 0.74]));

  for (const side of [-1, 1]) {
    const label = side < 0 ? 'left' : 'right';
    outfit.add(mesh(`present_${label}_jeans_upper_leg`, capsule(0.145, 0.42), materials.jeans, [side * 0.23, 0.69, 0.01], [1, 1, 0.92]));
    outfit.add(mesh(`present_${label}_jeans_lower_leg`, capsule(0.13, 0.43), materials.jeans, [side * 0.24, 0.31, 0.02], [1, 1, 0.88]));
    outfit.add(mesh(`present_${label}_jeans_cuff`, new THREE.CylinderGeometry(0.13, 0.13, 0.035, 24), materials.seam, [side * 0.24, 0.11, 0.02], [1, 1, 0.9]));
  }

  outfit.add(mesh('present_jeans_front_seam', new THREE.BoxGeometry(0.028, 0.44, 0.02), materials.seam, [0, 0.77, 0.37], [1, 1, 1]));
  outfit.add(mesh('present_jeans_belt_line', new THREE.TorusGeometry(0.48, 0.01, 8, 48), materials.seam, [0, 1.09, 0], [1, 0.7, 1], [Math.PI / 2, 0, 0]));

  const accessories = new THREE.Group();
  accessories.name = 'Frogface_Accessories';
  accessories.userData = {
    role: 'separate_accessories',
    necklace: 'peace_pendant_hangs_from_neck',
  };

  accessories.add(mesh('present_neck_chain', new THREE.TorusGeometry(0.37, 0.012, 8, 72), materials.gold, [0, 2.04, 0.08], [1, 0.6, 1], [Math.PI / 2, 0, 0]));
  accessories.add(mesh('present_chain_drop_left', capsule(0.01, 0.26), materials.gold, [-0.08, 1.91, 0.39], [1, 1, 1], [0.38, 0, -0.22]));
  accessories.add(mesh('present_chain_drop_right', capsule(0.01, 0.26), materials.gold, [0.08, 1.91, 0.39], [1, 1, 1], [0.38, 0, 0.22]));
  accessories.add(mesh('present_peace_pendant_ring', new THREE.TorusGeometry(0.085, 0.008, 8, 36), materials.gold, [0, 1.78, 0.43], [1, 1, 1]));
  accessories.add(mesh('present_peace_pendant_vertical', new THREE.BoxGeometry(0.012, 0.14, 0.012), materials.gold, [0, 1.78, 0.432], [1, 1, 1]));
  accessories.add(mesh('present_peace_pendant_left_leg', new THREE.BoxGeometry(0.012, 0.085, 0.012), materials.gold, [-0.028, 1.745, 0.433], [1, 1, 1], [0, 0, -0.78]));
  accessories.add(mesh('present_peace_pendant_right_leg', new THREE.BoxGeometry(0.012, 0.085, 0.012), materials.gold, [0.028, 1.745, 0.433], [1, 1, 1], [0, 0, 0.78]));

  outfit.add(accessories);
  return outfit;
}

function createScene(includePresentOutfit) {
  const scene = new THREE.Scene();
  scene.name = includePresentOutfit ? 'Frogface_Present_GLB' : 'Frogface_Base_GLB';
  scene.userData = {
    asset: scene.name,
    version: '0.1.0',
    canon: 'base-v3-neutral plus present grey jeans and necklace layer',
  };
  scene.add(createBaseGroup());
  if (includePresentOutfit) scene.add(createPresentOutfitGroup());
  return scene;
}

async function exportGlb(scene, filename) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(scene, {
    binary: true,
    onlyVisible: true,
    trs: false,
    includeCustomExtensions: false,
  });
  const output = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(JSON.stringify(result));
  const filePath = path.join(OUT_DIR, filename);
  await fs.writeFile(filePath, output);
  console.log(`Wrote ${path.relative(process.cwd(), filePath).replaceAll('\\', '/')}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await exportGlb(createScene(false), 'frogface-base.glb');
  await exportGlb(createScene(true), 'frogface-present.glb');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
