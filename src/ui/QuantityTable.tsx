import { useMemo } from "react";
import { useModelStore } from "@/store/useModelStore";
import { useViewStore } from "@/store/useViewStore";
import { buildRebarCurvePath } from "@/three/geometry/rebarCurve";
import { Icon } from "./Icon";
import type { RebarPolyline, RebarRole } from "@/domain/types";

const ROLE_SHAPE: Record<RebarRole, string> = {
  柱纵筋: "straight",
  柱箍筋: "crop_square",
  梁上部通长: "north",
  梁下部纵筋: "south",
  梁腰筋: "swap_horiz",
  梁拉筋: "linear_scale",
  梁箍筋: "crop_square",
  板底筋X: "east",
  板底筋Y: "north",
  板面筋X: "east",
  板面筋Y: "north",
  板分布筋: "horizontal_rule",
};

interface Row {
  mark: string;
  role: RebarRole;
  shape: string;
  diameter: number;
  unitLength: number;
  qty: number;
  mass: number;
}

/** 钢密度 7.85 g/cm³ = 7.85e-6 kg/mm³  */
function massPerBar(diameter: number, lengthMm: number): number {
  const r = diameter / 2;
  const volume = Math.PI * r * r * lengthMm; // mm³
  return volume * 7.85e-6; // kg
}

function computeRows(rebars: RebarPolyline[]): Row[] {
  const groups = new Map<string, { items: RebarPolyline[]; lengths: number[] }>();
  for (const r of rebars) {
    const key = `${r.role}|${r.grade}|${r.diameter}`;
    let g = groups.get(key);
    if (!g) {
      g = { items: [], lengths: [] };
      groups.set(key, g);
    }
    g.items.push(r);
    g.lengths.push(buildRebarCurvePath(r).totalLength);
  }
  const rows: Row[] = [];
  let i = 1;
  for (const [, g] of groups) {
    const sample = g.items[0];
    const avgLen = g.lengths.reduce((a, b) => a + b, 0) / g.lengths.length;
    const totalMass = g.lengths.reduce((sum, L) => sum + massPerBar(sample.diameter, L), 0);
    rows.push({
      mark: `${shortMark(sample.role)}-${String(i).padStart(2, "0")}`,
      role: sample.role,
      shape: ROLE_SHAPE[sample.role] ?? "straight",
      diameter: sample.diameter,
      unitLength: Math.round(avgLen),
      qty: g.items.length,
      mass: Math.round(totalMass * 10) / 10,
    });
    i++;
  }
  return rows;
}

function shortMark(role: RebarRole): string {
  if (role.includes("纵筋") || role.includes("通长")) return "V";
  if (role.includes("箍筋")) return "T";
  if (role.includes("腰") || role.includes("拉筋")) return "S";
  if (role.startsWith("板底")) return "B";
  if (role.startsWith("板面")) return "U";
  return "L";
}

export function QuantityTable() {
  const rebars = useModelStore((s) => s.geometry.rebars);
  const rows = useMemo(() => computeRows(rebars), [rebars]);
  const totalMass = rows.reduce((s, r) => s + r.mass, 0);
  const setSelected = useViewStore((s) => s.setSelected);

  return (
    <div className="flex w-3/5 flex-col gap-2 overflow-hidden p-compact-padding">
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1 text-label-md text-on-surface-variant">
          <Icon name="table_chart" size={14} /> QUANTITY TAKEOFF
        </h3>
        <div className="flex gap-2">
          <button className="text-on-surface-variant transition-colors hover:text-primary" title="筛选">
            <Icon name="filter_list" size={16} />
          </button>
          <button className="text-on-surface-variant transition-colors hover:text-primary" title="导出 CSV">
            <Icon name="download" size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-outline-variant/20 bg-surface-container">
        <table className="w-full whitespace-nowrap border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-outline-variant/30 bg-surface-variant/50 backdrop-blur-sm">
            <tr>
              <Th width="2.5rem">#</Th>
              <Th>Mark</Th>
              <Th>Shape</Th>
              <Th>Role</Th>
              <Th align="right">Dia</Th>
              <Th align="right">L (mm)</Th>
              <Th align="right">Qty</Th>
              <Th align="right" last>
                Mass (kg)
              </Th>
            </tr>
          </thead>
          <tbody className="text-body-md text-on-surface">
            {rows.map((r, idx) => (
              <tr
                key={r.mark}
                onClick={() => {
                  // 选中此组的第一根
                  const first = rebars.find(
                    (x) => x.role === r.role && x.diameter === r.diameter
                  );
                  if (first) setSelected(first.id);
                }}
                className={`cursor-pointer border-b border-outline-variant/10 transition-colors hover:bg-surface-variant/30 ${
                  idx % 2 === 1 ? "bg-surface-container-low/40" : ""
                }`}
              >
                <Td muted>{idx + 1}</Td>
                <Td bold>{r.mark}</Td>
                <Td>
                  <Icon name={r.shape} size={16} className="text-primary" />
                </Td>
                <Td muted>{r.role}</Td>
                <Td align="right">Φ{r.diameter}</Td>
                <Td align="right" tabular>
                  {r.unitLength}
                </Td>
                <Td align="right" tabular>
                  {r.qty}
                </Td>
                <Td align="right" tabular last className="text-secondary">
                  {r.mass.toFixed(1)}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-on-surface-variant">
                  无数据
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="sticky bottom-0 border-t border-outline-variant/30 bg-surface-container-high">
            <tr>
              <td
                colSpan={7}
                className="border-r border-outline-variant/10 p-2 px-3 text-right text-label-sm uppercase tracking-wider text-on-surface-variant"
              >
                Total Mass
              </td>
              <td className="tabular p-2 px-3 text-right text-label-md font-bold text-primary">
                {totalMass.toFixed(1)} kg
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  width,
  align = "left",
  last,
}: {
  children: React.ReactNode;
  width?: string;
  align?: "left" | "right";
  last?: boolean;
}) {
  return (
    <th
      style={{ width }}
      className={`border-outline-variant/10 p-2 px-3 text-label-sm uppercase tracking-wider text-on-surface-variant ${
        last ? "" : "border-r"
      } ${align === "right" ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
  bold,
  align,
  tabular,
  last,
  className = "",
}: {
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  align?: "left" | "right";
  tabular?: boolean;
  last?: boolean;
  className?: string;
}) {
  return (
    <td
      className={[
        "p-2 px-3",
        last ? "" : "border-r border-outline-variant/10",
        muted ? "text-on-surface-variant" : "",
        bold ? "font-medium" : "",
        align === "right" ? "text-right" : "",
        tabular ? "tabular" : "",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}
