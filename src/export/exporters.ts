import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { sceneRefs } from '../scene/sceneRefs';

/** 截屏当前画布为 PNG，并触发下载。 */
export function exportPNG(filename = 'beam.png') {
  const { gl, scene, camera } = sceneRefs;
  if (!gl || !scene || !camera) return;
  // 在导出前再渲染一帧，确保最新状态
  gl.render(scene, camera);
  const dataURL = gl.domElement.toDataURL('image/png');
  triggerDownload(dataURL, filename);
}

/** 导出可见构件根为 GLB（二进制 GLTF）。 */
export function exportGLB(filename = 'beam.glb') {
  const root = sceneRefs.contentRoot;
  if (!root) return;
  const exporter = new GLTFExporter();
  exporter.parse(
    root,
    (result) => {
      if (result instanceof ArrayBuffer) {
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, filename);
        URL.revokeObjectURL(url);
      } else {
        const json = JSON.stringify(result);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, filename.replace(/\.glb$/, '.gltf'));
        URL.revokeObjectURL(url);
      }
    },
    (err) => {
      console.error('GLTFExporter 失败', err);
    },
    { binary: true }
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
