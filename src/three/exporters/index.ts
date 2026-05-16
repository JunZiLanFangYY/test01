import * as THREE from "three";

export function exportPNG(gl: THREE.WebGLRenderer, filename = "rebar.png") {
  const url = gl.domElement.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export async function exportGLTF(scene: THREE.Scene, filename = "rebar.glb") {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      let blob: Blob;
      if (result instanceof ArrayBuffer) {
        blob = new Blob([result], { type: "model/gltf-binary" });
      } else {
        blob = new Blob([JSON.stringify(result)], { type: "model/gltf+json" });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    (err) => console.error("GLTF export error", err),
    { binary: true }
  );
}
