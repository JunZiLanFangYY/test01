import { useMemo } from "react";
import { useModelStore } from "@/store/useModelStore";
import { Icon } from "./Icon";
import type { ConcreteBox, RebarPolyline } from "@/domain/types";

/**
 * 2D 截面 / 平面视图，根据当前构件类型选择投影平面：
 * - 柱：俯视（X-Z 平面），切到柱中部高度，显示纵筋点 + 箍筋外框
 * - 梁：横截面（Z-Y 平面），显示纵筋点 + 典型箍筋外框
 * - 板：俯视（X-Z 平面），显示底筋网格
 */
export function SectionView() {
  const kind = useModelStore((s) => s.kind);
  const geometry = useModelStore((s) => s.geometry);
  const meta = geometry.meta;

  const sectionLabel =
    kind === "column"
      ? "SECTION A-A · COLUMN"
      : kind === "beam"
        ? "SECTION A-A · BEAM"
        : "PLAN VIEW · SLAB";

  return (
    <div className="flex w-2/5 flex-col gap-2 border-r border-outline-variant/30 p-compact-padding">
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1 text-label-md text-on-surface-variant">
          <Icon name="architecture" size={14} /> {sectionLabel}
        </h3>
        <button className="text-on-surface-variant transition-colors hover:text-primary" title="全屏">
          <Icon name="fullscreen" size={16} />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden rounded border border-outline-variant/20 bg-surface-container">
        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 bg-[size:10px_10px]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(66,71,84,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(66,71,84,0.15) 1px, transparent 1px)",
          }}
        />
        <SectionSVG kind={kind} concrete={geometry.concrete} rebars={geometry.rebars} />
        <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] uppercase tracking-wider text-on-surface-variant">
          {Object.entries(meta).slice(0, 3).map(([k, v]) => (
            <span key={k} className="tabular">
              <span className="opacity-60">{k}</span> · <span className="text-on-surface">{v}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SVGProps {
  kind: "column" | "beam" | "slab";
  concrete: ConcreteBox;
  rebars: RebarPolyline[];
}

function SectionSVG({ kind, concrete, rebars }: SVGProps) {
  const PAD = 24;
  // 选择投影平面
  const proj = useMemo(() => projectFor(kind, concrete), [kind, concrete]);

  return (
    <svg
      viewBox={`0 0 ${proj.viewW} ${proj.viewH}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full p-2"
    >
      {/* 主截面框 */}
      <rect
        x={PAD}
        y={PAD}
        width={proj.viewW - PAD * 2}
        height={proj.viewH - PAD * 2}
        fill="rgba(173,198,255,0.04)"
        stroke="rgba(212,228,250,0.6)"
        strokeWidth={1.2}
      />
      {/* 内部保护层虚线（柱） */}
      {kind === "column" && (
        <rect
          x={PAD + 12}
          y={PAD + 12}
          width={proj.viewW - PAD * 2 - 24}
          height={proj.viewH - PAD * 2 - 24}
          fill="none"
          stroke="rgba(173,198,255,0.5)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      )}

      {/* 钢筋投影 */}
      {rebars.map((r) => renderRebar(r, kind, concrete, proj, PAD))}

      {/* 尺寸标注 */}
      <DimLabel
        x={proj.viewW / 2}
        y={proj.viewH - 8}
        text={proj.dimX}
        anchor="middle"
      />
      <DimLabel
        x={10}
        y={proj.viewH / 2}
        text={proj.dimY}
        anchor="start"
        rotate
      />
    </svg>
  );
}

function projectFor(kind: string, concrete: ConcreteBox) {
  // 视图宽高（保持比例，固定 viewBox 短边 200）
  let dx = concrete.size.x;
  let dy = concrete.size.z;
  let dimX = `${concrete.size.x}mm`;
  let dimY = `${concrete.size.z}mm`;
  if (kind === "beam") {
    dx = concrete.size.z;
    dy = concrete.size.y;
    dimX = `${concrete.size.z}mm`;
    dimY = `${concrete.size.y}mm`;
  } else if (kind === "slab") {
    dx = concrete.size.x;
    dy = concrete.size.z;
  }
  const aspect = dx / dy;
  const viewH = 200;
  const viewW = Math.round(viewH * aspect);
  return { viewW, viewH, dx, dy, dimX, dimY };
}

function renderRebar(
  r: RebarPolyline,
  kind: string,
  concrete: ConcreteBox,
  proj: ReturnType<typeof projectFor>,
  pad: number
) {
  const w = proj.viewW - pad * 2;
  const h = proj.viewH - pad * 2;
  // 把世界坐标映射到 svg
  const mapColumn = (x: number, z: number) => ({
    x: pad + ((x - concrete.center.x + concrete.size.x / 2) / concrete.size.x) * w,
    y: pad + ((z - concrete.center.z + concrete.size.z / 2) / concrete.size.z) * h,
  });
  const mapBeamSection = (z: number, y: number) => ({
    x: pad + ((z - concrete.center.z + concrete.size.z / 2) / concrete.size.z) * w,
    y: pad + (1 - (y - concrete.center.y + concrete.size.y / 2) / concrete.size.y) * h,
  });
  const mapSlab = mapColumn;

  const color = getColor(r.role);

  if (kind === "column") {
    // 柱纵筋：投到中部高度的圆点
    if (r.role === "柱纵筋" && r.points.length >= 1) {
      const p = r.points[0];
      const m = mapColumn(p.x, p.z);
      const radius = Math.max(2.5, r.diameter / 6);
      return (
        <circle
          key={r.id}
          cx={m.x}
          cy={m.y}
          r={radius}
          fill={color}
          stroke="#051424"
          strokeWidth={0.5}
        />
      );
    }
    // 柱箍筋：取最大外接矩形
    if (r.role === "柱箍筋" && r.points.length > 0) {
      const xs = r.points.map((p) => p.x);
      const zs = r.points.map((p) => p.z);
      const a = mapColumn(Math.min(...xs), Math.min(...zs));
      const b = mapColumn(Math.max(...xs), Math.max(...zs));
      return (
        <rect
          key={r.id}
          x={a.x}
          y={a.y}
          width={b.x - a.x}
          height={b.y - a.y}
          fill="none"
          stroke={color}
          strokeWidth={1}
          rx={1}
        />
      );
    }
    return null;
  }

  if (kind === "beam") {
    if (
      (r.role === "梁上部通长" || r.role === "梁下部纵筋" || r.role === "梁腰筋") &&
      r.points.length >= 2
    ) {
      const sectionPoint =
        r.points.find((p) => Math.abs(p.x - concrete.center.x) < concrete.size.x * 0.45) ??
        r.points[Math.floor(r.points.length / 2)];
      const m = mapBeamSection(sectionPoint.z, sectionPoint.y);
      const radius = Math.max(2.5, r.diameter / 6);
      return (
        <circle
          key={r.id}
          cx={m.x}
          cy={m.y}
          r={radius}
          fill={color}
          stroke="#051424"
          strokeWidth={0.5}
        />
      );
    }
    if (r.role === "梁箍筋" && r.points.length > 0 && r.id.endsWith("-0")) {
      const ys = r.points.map((p) => p.y);
      const zs = r.points.map((p) => p.z);
      const a = mapBeamSection(Math.min(...zs), Math.max(...ys));
      const b = mapBeamSection(Math.max(...zs), Math.min(...ys));
      return (
        <rect
          key={r.id}
          x={a.x}
          y={a.y}
          width={Math.max(1, b.x - a.x)}
          height={Math.max(1, b.y - a.y)}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.9}
          rx={1}
        />
      );
    }
    return null;
  }

  if (kind === "slab") {
    if (r.points.length >= 2) {
      const p0 = r.points[0];
      const p1 = r.points[r.points.length - 1];
      const a = mapSlab(p0.x, p0.z);
      const b = mapSlab(p1.x, p1.z);
      return (
        <line
          key={r.id}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={color}
          strokeWidth={Math.max(0.6, r.diameter / 10)}
          opacity={r.role.startsWith("板面") ? 0.5 : 0.85}
        />
      );
    }
    return null;
  }
  return null;
}

function getColor(role: string): string {
  if (role.includes("纵筋") || role.includes("上部") || role.includes("面筋X")) return "#ff6b6b";
  if (role.includes("下部") || role.includes("底筋X")) return "#4d8eff";
  if (role.includes("腰")) return "#06d6a0";
  if (role.includes("箍")) return "#ffd166";
  if (role.includes("Y")) return "#adc6ff";
  return "#c2c6d6";
}

function DimLabel({
  x,
  y,
  text,
  anchor,
  rotate,
}: {
  x: number;
  y: number;
  text: string;
  anchor: "start" | "middle" | "end";
  rotate?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fill="rgba(212,228,250,0.6)"
      textAnchor={anchor}
      style={{ fontFamily: "Inter", letterSpacing: "0.05em" }}
      transform={rotate ? `rotate(-90 ${x} ${y})` : undefined}
    >
      {text}
    </text>
  );
}
