import * as THREE from 'three';

/**
 * 跨组件共享的场景引用，供工具栏调用导出 / 截图。
 * 在 BeamScene 内部填充，在 Toolbar 内部读取。
 */
export const sceneRefs: {
  gl: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  /** 仅包含可见构件的根 group（不含网格/灯光），用于导出 GLTF */
  contentRoot: THREE.Group | null;
} = {
  gl: null,
  scene: null,
  camera: null,
  contentRoot: null,
};
