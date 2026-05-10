import * as THREE from 'three';

/**
 * 程序化生成 HRB400 螺纹法线贴图（CanvasTexture）。
 * 思路：在 canvas 上画交错的斜线作为高度场，再转法线。这里直接画法线 RGB（简化）。
 *
 * 注意：贴图坐标 U 沿钢筋周向，V 沿钢筋长度方向（TubeGeometry 默认）。
 * 螺纹是绕 V 方向的斜纹。
 */
let cached: THREE.Texture | null = null;

export function getRibNormalTexture(): THREE.Texture {
  if (cached) return cached;
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 底色：法线朝外 (0.5, 0.5, 1.0) -> #8080ff
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, w, h);

  // 斜向螺纹：每隔若干像素画一条对角线，用红绿通道偏移模拟法线偏转
  const ribSpacingV = 32; // 沿 V 方向的螺纹间距
  const ribAngle = Math.PI / 6; // 30°
  ctx.lineWidth = 4;

  // 两组对称斜纹（X 形带肋更接近 HRB400 真实形态）
  for (let dir = 0; dir < 2; dir++) {
    const angle = dir === 0 ? ribAngle : -ribAngle;
    // 法线偏转方向：同方向的斜纹，亮侧偏 +X，暗侧偏 -X
    for (let v = -h; v < h * 2; v += ribSpacingV) {
      // 高光（凸起的一侧）
      ctx.strokeStyle = dir === 0 ? '#a890ff' : '#7090ff';
      ctx.beginPath();
      const dx = Math.cos(angle) * w * 2;
      const dy = Math.sin(angle) * w * 2;
      ctx.moveTo(-w, v);
      ctx.lineTo(-w + dx, v + dy);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  cached = tex;
  return tex;
}
