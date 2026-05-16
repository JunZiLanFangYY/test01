import { useMemo, useState } from "react";
import { useModelStore } from "@/store/useModelStore";
import { useViewStore } from "@/store/useViewStore";
import { lab, laE, bendDiameterFactor } from "@/domain/codes/22G101";
import type { SeismicLevel } from "@/domain/types";
import { buildRebarCurvePath } from "@/three/geometry/rebarCurve";
import { Icon } from "./Icon";
import { PanelColumn } from "./PanelColumn";
import { PanelBeam } from "./PanelBeam";
import { PanelSlab } from "./PanelSlab";
import { AICopilot } from "./AICopilot";

type Tab = "parameters" | "material" | "selected";
const PRESET_VERSION = 1;

export function RightInspector() {
  const kind = useModelStore((s) => s.kind);
  const selectedId = useViewStore((s) => s.selectedRebarId);
  const [tab, setTab] = useState<Tab>("parameters");

  // 当选中钢筋时，自动切到 selected
  const activeTab: Tab = selectedId ? "selected" : tab;

  return (
    <aside className="fixed right-0 top-16 z-40 flex h-[calc(100vh-64px)] w-80 flex-col border-l border-outline-variant/20 bg-surface-container-highest/60 backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-outline-variant/20 bg-surface-container-lowest/50 px-gutter py-panel-gap">
        <h2 className="flex items-center gap-2 text-headline-md font-bold text-primary">
          <Icon name="info" size={20} />
          Inspector
        </h2>
        <p className="mt-1 text-label-md text-on-surface-variant">
          {selectedId ? `选中钢筋 ${selectedId}` : "构件参数 · 22G101"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex border-b border-outline-variant/20 px-2 pt-2">
          <TabBtn active={activeTab === "parameters"} onClick={() => setTab("parameters")}>
            Parameters
          </TabBtn>
          <TabBtn active={activeTab === "material"} onClick={() => setTab("material")}>
            Material
          </TabBtn>
          {selectedId && (
            <TabBtn active={activeTab === "selected"} onClick={() => setTab("selected")}>
              Selected
            </TabBtn>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-gutter">
          {activeTab === "parameters" && (
            <>
              {kind === "column" && <PanelColumn />}
              {kind === "beam" && <PanelBeam />}
              {kind === "slab" && <PanelSlab />}
            </>
          )}
          {activeTab === "material" && <MaterialPanel />}
          {activeTab === "selected" && <SelectedPanel />}
        </div>

        <div className="border-t border-outline-variant/20 bg-surface-container-lowest/50 p-gutter">
          <button
            onClick={() => {
              const { kind, column, beam, slab } = useModelStore.getState();
              localStorage.setItem(
                "rebarvis-preset",
                JSON.stringify({
                  version: PRESET_VERSION,
                  data: { kind, column, beam, slab },
                })
              );
            }}
            className="w-full rounded bg-primary py-2 text-label-md font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90"
          >
            Apply Changes · 保存预设
          </button>
        </div>
      </div>

      {/* AI Copilot */}
      <AICopilot />
    </aside>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-label-sm uppercase tracking-wider transition-colors ${
        active
          ? "border-b-2 border-primary font-bold text-primary"
          : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function MaterialPanel() {
  const kind = useModelStore((s) => s.kind);
  const column = useModelStore((s) => s.column);
  const beam = useModelStore((s) => s.beam);
  const slab = useModelStore((s) => s.slab);
  const m = kind === "column" ? column : kind === "beam" ? beam : slab;

  // 当前主筋直径与级别（取构件代表性主筋）
  const main = useMemo(() => {
    if (kind === "column") {
      return { d: column.longitudinalDiameter, grade: column.longitudinalGrade };
    }
    if (kind === "beam") {
      return { d: beam.bottomDiameter, grade: beam.bottomGrade };
    }
    return { d: slab.bottomXDiameter, grade: slab.bottomXGrade };
  }, [beam, column, kind, slab]);

  const labVal = lab(main.grade, m.concrete, main.d);
  const laeVal = laE(main.grade, m.concrete, main.d, m.seismic as SeismicLevel);
  const bendFactor = bendDiameterFactor(main.grade, main.d);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 flex items-center gap-1 text-label-sm uppercase tracking-wider text-on-surface-variant">
          <Icon name="science" size={14} /> Materials
        </h4>
        <KV rows={[
          ["混凝土", m.concrete],
          ["钢筋级别", main.grade],
          ["主筋直径", `Φ${main.d}`],
          ["保护层", `${m.cover} mm`],
          ["抗震等级", m.seismic],
        ]} />
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-1 text-label-sm uppercase tracking-wider text-on-surface-variant">
          <Icon name="rule" size={14} /> 22G101 计算值
        </h4>
        <KV rows={[
          ["lab (基本锚固)", `${Math.round(labVal)} mm`],
          ["laE (抗震锚固)", `${Math.round(laeVal)} mm`],
          ["弯弧内径系数", `${bendFactor}d`],
          ["箍筋弯钩", "10d 平直段"],
        ]} highlight />
      </div>

      <div className="rounded border border-primary/20 bg-primary-container/10 p-3 text-[12px] leading-relaxed text-on-surface-variant">
        <div className="mb-1 flex items-center gap-1 text-primary">
          <Icon name="lightbulb" fill size={14} /> 提示
        </div>
        本面板展示当前构件主筋按 22G101 的关键计算值，更换混凝土等级 / 钢筋级别 / 抗震等级后会即时刷新。
      </div>
    </div>
  );
}

function SelectedPanel() {
  const geometry = useModelStore((s) => s.geometry);
  const selectedId = useViewStore((s) => s.selectedRebarId);
  const setSelected = useViewStore((s) => s.setSelected);
  const rebar = geometry.rebars.find((r) => r.id === selectedId);
  const length = useMemo(
    () => (rebar ? buildRebarCurvePath(rebar).totalLength : 0),
    [rebar]
  );
  if (!rebar) {
    return <div className="text-body-md text-on-surface-variant">未选中钢筋</div>;
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1 text-label-sm uppercase tracking-wider text-primary">
          <Icon name="my_location" size={14} /> 选中钢筋
        </h4>
        <button
          onClick={() => setSelected(null)}
          className="text-on-surface-variant hover:text-primary"
          title="取消选择"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <KV rows={[
        ["编号 ID", rebar.id],
        ["类型", rebar.role],
        ["直径", `Φ${rebar.diameter}`],
        ["级别", rebar.grade],
        ["折点数", String(rebar.points.length)],
        ["弯弧内径", `${rebar.bendDiameterFactor}d`],
        ["展开长度", `${length.toFixed(0)} mm`],
      ]} />
      {rebar.label && (
        <div className="rounded border border-outline-variant/20 bg-surface-container p-2 text-body-md text-on-surface-variant">
          {rebar.label}
        </div>
      )}
    </div>
  );
}

function KV({
  rows,
  highlight,
}: {
  rows: [string, string][];
  highlight?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded border border-outline-variant/20 divide-y divide-outline-variant/10">
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className={`flex items-center justify-between bg-surface-container px-2 py-1.5 ${
            i % 2 === 1 ? "bg-surface-container-low/50" : ""
          }`}
        >
          <span className="text-body-md text-on-surface-variant">{k}</span>
          <span
            className={`tabular text-body-md ${
              highlight ? "text-primary" : "text-on-surface"
            }`}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
