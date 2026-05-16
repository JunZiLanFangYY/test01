import { create } from "zustand";

export type RenderMode = "simple" | "realistic";

interface ViewState {
  /** 选中钢筋 id */
  selectedRebarId: string | null;
  setSelected: (id: string | null) => void;
  /** 显示混凝土 */
  showConcrete: boolean;
  toggleConcrete: () => void;
  concreteOpacity: number;
  setConcreteOpacity: (v: number) => void;
  renderMode: RenderMode;
  setRenderMode: (mode: RenderMode) => void;
  /** 爆炸系数 0..1 */
  explode: number;
  setExplode: (v: number) => void;
  /** 剖切：每个轴的位置（-1..1，0 表示中心；启用时切除该轴正向部分） */
  clipX: number | null;
  clipY: number | null;
  clipZ: number | null;
  setClip: (axis: "x" | "y" | "z", v: number | null) => void;
  cameraFit: number;
  cameraZoomIn: number;
  cameraZoomOut: number;
  fitCamera: () => void;
  zoomInCamera: () => void;
  zoomOutCamera: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  selectedRebarId: null,
  setSelected: (id) => set({ selectedRebarId: id }),
  showConcrete: true,
  toggleConcrete: () => set((s) => ({ showConcrete: !s.showConcrete })),
  concreteOpacity: 0.22,
  setConcreteOpacity: (v) => set({ concreteOpacity: v }),
  renderMode: "simple",
  setRenderMode: (mode) => set({ renderMode: mode }),
  explode: 0,
  setExplode: (v) => set({ explode: v }),
  clipX: null,
  clipY: null,
  clipZ: null,
  setClip: (axis, v) =>
    set(() =>
      axis === "x" ? { clipX: v } : axis === "y" ? { clipY: v } : { clipZ: v }
    ),
  /** 摄像机触发计数，自增即触发对应动作 */
  cameraFit: 0,
  cameraZoomIn: 0,
  cameraZoomOut: 0,
  fitCamera: () => set((s) => ({ cameraFit: s.cameraFit + 1 })),
  zoomInCamera: () => set((s) => ({ cameraZoomIn: s.cameraZoomIn + 1 })),
  zoomOutCamera: () => set((s) => ({ cameraZoomOut: s.cameraZoomOut + 1 })),
}));
