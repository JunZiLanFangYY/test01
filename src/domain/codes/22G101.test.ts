import { describe, it, expect } from "vitest";
import {
  lab,
  laE,
  bendDiameterFactor,
  columnStirrupEncryption,
  beamStirrupEncryptionLength,
} from "./22G101";

describe("22G101 锚固长度", () => {
  it("HRB400 + C30 + d=20 → lab = 35×20 = 700mm", () => {
    expect(lab("HRB400", "C30", 20)).toBe(700);
  });

  it("d>25 时 lab 需 ×1.10", () => {
    // HRB400 + C30 + d=28 → 35*28*1.1 = 1078
    expect(lab("HRB400", "C30", 28)).toBeCloseTo(1078);
  });

  it("一级抗震 laE = 1.15 × la", () => {
    const la = lab("HRB400", "C30", 20);
    expect(laE("HRB400", "C30", 20, "一级")).toBeCloseTo(1.15 * la);
  });
});

describe("弯弧内径系数", () => {
  it("HPB300 = 2.5", () => {
    expect(bendDiameterFactor("HPB300", 12)).toBe(2.5);
  });
  it("HRB400 d=20 → 4，d=28 → 6", () => {
    expect(bendDiameterFactor("HRB400", 20)).toBe(4);
    expect(bendDiameterFactor("HRB400", 28)).toBe(6);
  });
});

describe("加密区计算", () => {
  it("一层柱底 max(Hn/3, 500)", () => {
    const z = columnStirrupEncryption(3000, 500, true);
    expect(z.bottom).toBe(1000);
  });
  it("梁一级抗震加密 max(2hb, 500)", () => {
    expect(beamStirrupEncryptionLength(600, "一级")).toBe(1200);
    expect(beamStirrupEncryptionLength(200, "一级")).toBe(500);
  });
});
