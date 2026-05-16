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

  ctx.fillStyle = "#4f4f4f";
  ctx.fillRect(0, 0, 256, 256);

  for (let y = -256; y < 512; y += 32) {
    const gradient = ctx.createLinearGradient(0, y, 256, y + 44);
    gradient.addColorStop(0, "#2f2f2f");
    gradient.addColorStop(0.38, "#d0d0d0");
    gradient.addColorStop(0.52, "#ffffff");
    gradient.addColorStop(1, "#2f2f2f");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, y + 10);
    ctx.quadraticCurveTo(70, y - 16, 128, y + 18);
    ctx.quadraticCurveTo(186, y + 52, 256, y + 26);
    ctx.lineTo(256, y + 40);
    ctx.quadraticCurveTo(186, y + 66, 128, y + 32);
    ctx.quadraticCurveTo(70, y - 2, 0, y + 24);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 0.65;
  for (let x = 0; x < 256; x += 18) {
    ctx.strokeStyle = x % 36 === 0 ? "#a6a6a6" : "#5c5c5c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 28, 256);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  rebarRibTexture = new THREE.CanvasTexture(canvas);
  rebarRibTexture.wrapS = THREE.RepeatWrapping;
  rebarRibTexture.wrapT = THREE.RepeatWrapping;
  rebarRibTexture.repeat.set(1, 18);
  rebarRibTexture.colorSpace = THREE.SRGBColorSpace;
  rebarRibTexture.needsUpdate = true;
  return rebarRibTexture;
}
