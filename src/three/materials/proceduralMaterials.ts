import * as THREE from "three";

let concreteTextures: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;
let rebarRibTexture: THREE.CanvasTexture | null = null;

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function getConcreteTextures() {
  if (concreteTextures) return concreteTextures;

  const colorCanvas = makeCanvas(256);
  const colorCtx = colorCanvas.getContext("2d");
  if (!colorCtx) throw new Error("Cannot create concrete texture context");

  const base = colorCtx.createLinearGradient(0, 0, 256, 256);
  base.addColorStop(0, "#aab2bb");
  base.addColorStop(0.5, "#c5ccd2");
  base.addColorStop(1, "#8e98a3");
  colorCtx.fillStyle = base;
  colorCtx.fillRect(0, 0, 256, 256);

  const image = colorCtx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const noise = Math.random() * 46 - 23;
    const speckle = Math.random() > 0.985 ? -55 : 0;
    image.data[i] = THREE.MathUtils.clamp(image.data[i] + noise + speckle, 0, 255);
    image.data[i + 1] = THREE.MathUtils.clamp(image.data[i + 1] + noise + speckle, 0, 255);
    image.data[i + 2] = THREE.MathUtils.clamp(image.data[i + 2] + noise + speckle, 0, 255);
  }
  colorCtx.putImageData(image, 0, 0);

  const bumpCanvas = makeCanvas(256);
  const bumpCtx = bumpCanvas.getContext("2d");
  if (!bumpCtx) throw new Error("Cannot create concrete bump context");
  const bump = bumpCtx.createImageData(256, 256);
  for (let i = 0; i < bump.data.length; i += 4) {
    const value = Math.floor(120 + Math.random() * 70);
    bump.data[i] = value;
    bump.data[i + 1] = value;
    bump.data[i + 2] = value;
    bump.data[i + 3] = 255;
  }
  bumpCtx.putImageData(bump, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  for (const texture of [map, bumpMap]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 2.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }

  concreteTextures = { map, bumpMap };
  return concreteTextures;
}

export function getRebarRibTexture() {
  if (rebarRibTexture) return rebarRibTexture;

  const canvas = makeCanvas(256);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot create rebar rib texture context");

  ctx.fillStyle = "#777777";
  ctx.fillRect(0, 0, 256, 256);

  const base = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < base.data.length; i += 4) {
    const n = Math.random() * 28 - 14;
    const v = THREE.MathUtils.clamp(112 + n, 0, 255);
    base.data[i] = v;
    base.data[i + 1] = v;
    base.data[i + 2] = v;
    base.data[i + 3] = 255;
  }
  ctx.putImageData(base, 0, 0);

  ctx.globalCompositeOperation = "screen";
  for (let y = -256; y < 512; y += 28) {
    const gradient = ctx.createLinearGradient(0, y + 4, 256, y + 40);
    gradient.addColorStop(0, "#101010");
    gradient.addColorStop(0.42, "#b8b8b8");
    gradient.addColorStop(0.5, "#f6f6f6");
    gradient.addColorStop(0.58, "#b0b0b0");
    gradient.addColorStop(1, "#101010");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-10, y + 20);
    ctx.lineTo(112, y - 10);
    ctx.lineTo(266, y + 32);
    ctx.lineTo(266, y + 44);
    ctx.lineTo(112, y + 2);
    ctx.lineTo(-10, y + 32);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, y + 52);
    ctx.lineTo(112, y + 82);
    ctx.lineTo(266, y + 40);
    ctx.lineTo(266, y + 52);
    ctx.lineTo(112, y + 94);
    ctx.lineTo(-10, y + 64);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.45;
  for (let x = 0; x < 256; x += 32) {
    ctx.strokeStyle = "#343434";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 18, 256);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  rebarRibTexture = new THREE.CanvasTexture(canvas);
  rebarRibTexture.wrapS = THREE.RepeatWrapping;
  rebarRibTexture.wrapT = THREE.RepeatWrapping;
  rebarRibTexture.repeat.set(1.15, 10);
  rebarRibTexture.colorSpace = THREE.SRGBColorSpace;
  rebarRibTexture.anisotropy = 8;
  rebarRibTexture.needsUpdate = true;
  return rebarRibTexture;
}
