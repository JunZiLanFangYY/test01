import { create } from "zustand";
import type { MemberGeometry } from "@/domain/types";
import { buildColumn, type ColumnParams } from "@/domain/members/column";
import { buildBeam, type BeamParams } from "@/domain/members/beam";
import { buildSlab, type SlabParams } from "@/domain/members/slab";

export type MemberKind = "column" | "beam" | "slab";

export const defaultColumn: ColumnParams = {
  b: 600,
  h: 600,
  Hn: 3000,
  cover: 25,
  nx: 3,
  nz: 3,
  longitudinalDiameter: 22,
  longitudinalGrade: "HRB400",
  stirrupDiameter: 10,
  stirrupGrade: "HRB400",
  stirrupSpacing: 200,
  stirrupSpacingEnc: 100,
  concrete: "C30",
  seismic: "二级",
  isGroundFloor: true,
};

export const defaultBeam: BeamParams = {
  b: 300,
  h: 600,
  Ln: 6000,
  cover: 25,
  topCount: 4,
  topDiameter: 22,
  topGrade: "HRB400",
  bottomCount: 4,
  bottomDiameter: 25,
  bottomGrade: "HRB400",
  stirrupDiameter: 10,
  stirrupGrade: "HRB400",
  stirrupSpacingEnc: 100,
  stirrupSpacing: 200,
  sideBarMode: "auto",
  sideBarCountPerSide: 2,
  sideBarDiameter: 12,
  sideBarGrade: "HRB400",
  tieEnabled: true,
  concrete: "C30",
  seismic: "二级",
};

export const defaultSlab: SlabParams = {
  Lx: 4000,
  Lz: 4000,
  thickness: 120,
  cover: 15,
  supportWidth: 300,
  bottomXDiameter: 10,
  bottomXSpacing: 150,
  bottomXGrade: "HRB400",
  bottomZDiameter: 10,
  bottomZSpacing: 150,
  bottomZGrade: "HRB400",
  topLayer: true,
  topXDiameter: 10,
  topXSpacing: 200,
  topXGrade: "HRB400",
  topZDiameter: 10,
  topZSpacing: 200,
  topZGrade: "HRB400",
  concrete: "C30",
  seismic: "二级",
};

interface ModelState {
  kind: MemberKind;
  column: ColumnParams;
  beam: BeamParams;
  slab: SlabParams;
  geometry: MemberGeometry;
  setKind: (k: MemberKind) => void;
  updateColumn: (p: Partial<ColumnParams>) => void;
  updateBeam: (p: Partial<BeamParams>) => void;
  updateSlab: (p: Partial<SlabParams>) => void;
}

function compute(
  kind: MemberKind,
  column: ColumnParams,
  beam: BeamParams,
  slab: SlabParams
): MemberGeometry {
  if (kind === "column") return buildColumn(column);
  if (kind === "beam") return buildBeam(beam);
  return buildSlab(slab);
}

export const useModelStore = create<ModelState>((set, get) => ({
  kind: "column",
  column: defaultColumn,
  beam: defaultBeam,
  slab: defaultSlab,
  geometry: buildColumn(defaultColumn),
  setKind: (k) => {
    const s = get();
    set({ kind: k, geometry: compute(k, s.column, s.beam, s.slab) });
  },
  updateColumn: (p) => {
    const s = get();
    const next = { ...s.column, ...p };
    set({ column: next, geometry: compute(s.kind, next, s.beam, s.slab) });
  },
  updateBeam: (p) => {
    const s = get();
    const next = { ...s.beam, ...p };
    set({ beam: next, geometry: compute(s.kind, s.column, next, s.slab) });
  },
  updateSlab: (p) => {
    const s = get();
    const next = { ...s.slab, ...p };
    set({ slab: next, geometry: compute(s.kind, s.column, s.beam, next) });
  },
}));
