import type { MemberGeometry, RebarPolyline, RebarRole } from "@/domain/types";
import { buildRebarCurvePath } from "@/three/geometry/rebarCurve";

const STEEL_DENSITY_KG_PER_MM3 = 7.85e-6;

export function rebarMassKg(diameter: number, lengthMm: number): number {
  const radius = diameter / 2;
  const volume = Math.PI * radius * radius * lengthMm;
  return volume * STEEL_DENSITY_KG_PER_MM3;
}

export function enrichRebarQuantity(rebar: RebarPolyline): RebarPolyline {
  const lengthMm = buildRebarCurvePath(rebar).totalLength;
  return {
    ...rebar,
    lengthMm,
    massKg: rebarMassKg(rebar.diameter, lengthMm),
  };
}

export function enrichMemberGeometryQuantity(geometry: MemberGeometry): MemberGeometry {
  return {
    ...geometry,
    rebars: geometry.rebars.map(enrichRebarQuantity),
  };
}

export interface QuantityRow {
  mark: string;
  role: RebarRole;
  diameter: number;
  unitLength: number;
  qty: number;
  mass: number;
}

function shortMark(role: RebarRole): string {
  if (role.includes("纵筋") || role.includes("通长")) return "V";
  if (role.includes("箍筋")) return "T";
  if (role.includes("腰") || role.includes("拉筋")) return "S";
  if (role.startsWith("板底")) return "B";
  if (role.startsWith("板面")) return "U";
  return "L";
}

export function computeQuantityRows(rebars: RebarPolyline[]): QuantityRow[] {
  const groups = new Map<string, { items: RebarPolyline[]; lengths: number[] }>();
  for (const rebar of rebars) {
    const key = `${rebar.role}|${rebar.grade}|${rebar.diameter}`;
    let group = groups.get(key);
    if (!group) {
      group = { items: [], lengths: [] };
      groups.set(key, group);
    }
    group.items.push(rebar);
    group.lengths.push(rebar.lengthMm ?? 0);
  }

  const rows: QuantityRow[] = [];
  let index = 1;
  for (const [, group] of groups) {
    const sample = group.items[0];
    const avgLen = group.lengths.reduce((sum, length) => sum + length, 0) / group.lengths.length;
    const totalMass = group.items.reduce((sum, item) => sum + (item.massKg ?? 0), 0);
    rows.push({
      mark: `${shortMark(sample.role)}-${String(index).padStart(2, "0")}`,
      role: sample.role,
      diameter: sample.diameter,
      unitLength: Math.round(avgLen),
      qty: group.items.length,
      mass: Math.round(totalMass * 10) / 10,
    });
    index++;
  }
  return rows;
}
