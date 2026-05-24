import { describe, expect, it } from "vitest";
import { buildColumn, type ColumnParams } from "./column";

const baseColumn: ColumnParams = {
  b: 500,
  h: 500,
  Hn: 3000,
  cover: 25,
  nx: 4,
  nz: 4,
  longitudinalDiameter: 20,
  longitudinalGrade: "HRB400",
  stirrupDiameter: 10,
  stirrupGrade: "HRB400",
  stirrupSpacing: 200,
  stirrupSpacingEnc: 100,
  concrete: "C30",
  seismic: "二级",
  isGroundFloor: true,
};

describe("柱 22G101 构造生成", () => {
  it("柱箍筋生成双 135° 弯钩且位于截面内", () => {
    const geometry = buildColumn(baseColumn);
    const stirrup = geometry.rebars.find((r) => r.role === "柱箍筋");
    expect(stirrup).toBeDefined();

    const points = stirrup!.points;
    const hookLen = Math.hypot(points[1].x - points[0].x, points[1].z - points[0].z);
    const otherHookLen = Math.hypot(points[6].x - points[5].x, points[6].z - points[5].z);
    const bs = baseColumn.b - 2 * baseColumn.cover - baseColumn.stirrupDiameter;
    const hs = baseColumn.h - 2 * baseColumn.cover - baseColumn.stirrupDiameter;

    expect(points).toHaveLength(7);
    expect(hookLen).toBeCloseTo(100);
    expect(otherHookLen).toBeCloseTo(100);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(-bs / 2);
      expect(p.x).toBeLessThanOrEqual(bs / 2);
      expect(p.z).toBeGreaterThanOrEqual(-hs / 2);
      expect(p.z).toBeLessThanOrEqual(hs / 2);
    }
  });

  it("柱顶底加密区重叠时不重复生成同标高箍筋", () => {
    const geometry = buildColumn({ ...baseColumn, Hn: 1800 });
    const ys = geometry.rebars.filter((r) => r.role === "柱箍筋").map((r) => r.points[0].y);
    const unique = ys.filter((y, idx) => idx === 0 || y - ys[idx - 1] > 5);

    expect(ys).toHaveLength(unique.length);
  });
});
