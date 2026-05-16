import { describe, expect, it } from "vitest";
import type { RebarPolyline } from "@/domain/types";
import { computeQuantityRows, enrichRebarQuantity, rebarMassKg } from "./quantity";

function straightRebar(id: string, lengthMm: number, diameter = 10): RebarPolyline {
  return {
    id,
    role: "板底筋X",
    diameter,
    grade: "HRB400",
    bendDiameterFactor: 4,
    points: [
      { x: 0, y: 0, z: 0 },
      { x: lengthMm, y: 0, z: 0 },
    ],
  };
}

describe("钢筋工程量", () => {
  it("按直径和长度计算单根质量", () => {
    expect(rebarMassKg(10, 1000)).toBeCloseTo(0.6165, 3);
  });

  it("为钢筋补充展开长度和质量", () => {
    const rebar = enrichRebarQuantity(straightRebar("r1", 1000));
    expect(rebar.lengthMm).toBeCloseTo(1000, 0);
    expect(rebar.massKg).toBeCloseTo(0.6165, 3);
  });

  it("按角色、级别、直径汇总工程量行", () => {
    const rebars = [
      enrichRebarQuantity(straightRebar("r1", 1000)),
      enrichRebarQuantity(straightRebar("r2", 1200)),
      enrichRebarQuantity(straightRebar("r3", 800, 12)),
    ];

    const rows = computeQuantityRows(rebars);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ mark: "B-01", qty: 2, diameter: 10, unitLength: 1100 });
    expect(rows[1]).toMatchObject({ mark: "B-02", qty: 1, diameter: 12, unitLength: 800 });
  });
});
