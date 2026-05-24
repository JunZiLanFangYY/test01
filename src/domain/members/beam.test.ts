import { describe, expect, it } from "vitest";
import { buildBeam, type BeamParams } from "./beam";

const baseBeam: BeamParams = {
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

describe("梁 22G101 构造生成", () => {
  it("腹板高度满足要求时自动生成侧面构造筋与拉筋", () => {
    const geometry = buildBeam(baseBeam);
    expect(geometry.rebars.filter((r) => r.role === "梁腰筋")).toHaveLength(4);
    expect(geometry.rebars.filter((r) => r.role === "梁拉筋").length).toBeGreaterThan(0);
    expect(geometry.meta.侧面构造筋).toBe("每侧2Φ12");
    expect(geometry.meta.拉筋).toBe("Φ6@400");
  });

  it("腹板高度不足 450mm 时 auto 模式不生成侧面构造筋", () => {
    const geometry = buildBeam({ ...baseBeam, h: 420 });
    expect(geometry.rebars.filter((r) => r.role === "梁腰筋")).toHaveLength(0);
    expect(geometry.rebars.filter((r) => r.role === "梁拉筋")).toHaveLength(0);
  });

  it("梁宽大于 350mm 时拉筋默认直径为 8mm", () => {
    const geometry = buildBeam({ ...baseBeam, b: 400 });
    const tie = geometry.rebars.find((r) => r.role === "梁拉筋");
    expect(tie?.diameter).toBe(8);
  });

  it("侧面构造筋两端按 15d 伸入锚固", () => {
    const geometry = buildBeam(baseBeam);
    const sideBar = geometry.rebars.find((r) => r.role === "梁腰筋");
    expect(sideBar?.points[0].x).toBeCloseTo(-3000 - 15 * 12);
    expect(sideBar?.points[1].x).toBeCloseTo(3000 + 15 * 12);
  });

  it("在元数据中输出梁上部和下部纵筋净距校核", () => {
    const geometry = buildBeam(baseBeam);
    expect(geometry.meta.上部净距校核).toBe("满足 47≥33mm");
    expect(geometry.meta.下部净距校核).toBe("满足 43≥25mm");
  });

  it("梁箍筋 135° 弯钩平直段按 max(10d,75) 生成并位于截面内", () => {
    const geometry = buildBeam(baseBeam);
    const stirrup = geometry.rebars.find((r) => r.role === "梁箍筋");
    expect(stirrup).toBeDefined();

    const points = stirrup!.points;
    const hookLen = Math.hypot(points[1].y - points[0].y, points[1].z - points[0].z);
    const otherHookLen = Math.hypot(points[5].y - points[4].y, points[5].z - points[4].z);
    const bs = baseBeam.b - 2 * baseBeam.cover - baseBeam.stirrupDiameter;
    const hs = baseBeam.h - 2 * baseBeam.cover - baseBeam.stirrupDiameter;

    expect(hookLen).toBeCloseTo(100);
    expect(otherHookLen).toBeCloseTo(100);
    for (const p of points) {
      expect(p.y).toBeGreaterThanOrEqual(-hs / 2);
      expect(p.y).toBeLessThanOrEqual(hs / 2);
      expect(p.z).toBeGreaterThanOrEqual(-bs / 2);
      expect(p.z).toBeLessThanOrEqual(bs / 2);
    }
  });

  it("纵筋过密时在元数据中提示净距不足", () => {
    const geometry = buildBeam({ ...baseBeam, b: 220, topCount: 5, bottomCount: 5 });
    expect(`${geometry.meta.上部净距校核}`).toContain("不足");
    expect(`${geometry.meta.下部净距校核}`).toContain("不足");
  });

  it("短梁两端加密区重叠时不重复生成同位置箍筋", () => {
    const geometry = buildBeam({ ...baseBeam, Ln: 1800 });
    const xs = geometry.rebars.filter((r) => r.role === "梁箍筋").map((r) => r.points[0].x);
    const unique = xs.filter((x, idx) => idx === 0 || x - xs[idx - 1] > 5);

    expect(xs).toHaveLength(unique.length);
  });
});
