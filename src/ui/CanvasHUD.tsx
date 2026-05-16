import { useModelStore } from "@/store/useModelStore";
import { useViewStore } from "@/store/useViewStore";
import { Icon } from "./Icon";

/** 3D 视口左上角：视图工具集（爆炸 + 剖切 + 混凝土显隐） */
export function ViewToolsHUD() {
  const showConcrete = useViewStore((s) => s.showConcrete);
  const toggleConcrete = useViewStore((s) => s.toggleConcrete);
  const concreteOpacity = useViewStore((s) => s.concreteOpacity);
  const setConcreteOpacity = useViewStore((s) => s.setConcreteOpacity);
  const renderMode = useViewStore((s) => s.renderMode);
  const setRenderMode = useViewStore((s) => s.setRenderMode);
  const explode = useViewStore((s) => s.explode);
  const setExplode = useViewStore((s) => s.setExplode);
  const { clipX, clipY, clipZ, setClip } = useViewStore();

  return (
    <div className="absolute left-4 top-4 z-10 w-64 rounded border border-outline-variant/30 bg-surface-container-highest/70 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-outline-variant/20 px-3 py-2">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">View Tools</span>
        <button
          onClick={toggleConcrete}
          className={`flex items-center gap-1 rounded px-2 py-1 text-label-sm uppercase tracking-wider transition-colors ${
            showConcrete
              ? "bg-primary/15 text-primary"
              : "bg-surface-variant/40 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Icon name={showConcrete ? "visibility" : "visibility_off"} size={14} />
          Concrete
        </button>
      </div>

      <div className="space-y-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon name="view_in_ar" size={14} className="text-primary" />
          <span className="w-10 text-label-md text-on-surface-variant">Mode</span>
          <div className="flex flex-1 overflow-hidden rounded border border-outline-variant/20 bg-surface-container-low">
            <button
              onClick={() => setRenderMode("simple")}
              className={`flex-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                renderMode === "simple"
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setRenderMode("realistic")}
              className={`flex-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                renderMode === "realistic"
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Real
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="opacity" size={14} className="text-primary" />
          <span className="w-10 text-label-md text-on-surface-variant">Opacity</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            disabled={!showConcrete}
            value={concreteOpacity}
            onChange={(e) => setConcreteOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-primary disabled:opacity-30"
          />
          <span className="tabular w-8 text-right text-label-sm text-on-surface-variant">
            {Math.round(concreteOpacity * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" size={14} className="text-primary" />
          <span className="w-10 text-label-md text-on-surface-variant">Explode</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={(e) => setExplode(parseFloat(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="tabular w-8 text-right text-label-sm text-on-surface-variant">
            {explode.toFixed(2)}
          </span>
        </div>

        {(["x", "y", "z"] as const).map((axis) => {
          const v = axis === "x" ? clipX : axis === "y" ? clipY : clipZ;
          const enabled = v !== null;
          return (
            <div key={axis} className="flex items-center gap-2">
              <button
                onClick={() => setClip(axis, enabled ? null : 0)}
                className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                  enabled ? "bg-primary/20 text-primary" : "bg-surface-variant/40 text-on-surface-variant hover:text-on-surface"
                }`}
                title={`切换 ${axis.toUpperCase()} 轴剖切`}
              >
                <Icon name="content_cut" size={12} />
              </button>
              <span className="w-6 text-label-md uppercase text-on-surface-variant">{axis}</span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.02}
                disabled={!enabled}
                value={v ?? 0}
                onChange={(e) => setClip(axis, parseFloat(e.target.value))}
                className="flex-1 accent-primary disabled:opacity-30"
              />
              <span className="tabular w-8 text-right text-label-sm text-on-surface-variant">
                {enabled ? (v! >= 0 ? "+" : "") + v!.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 3D 视口右上角：摄像机控制 */
export function CameraHUD() {
  const fit = useViewStore((s) => s.fitCamera);
  const zin = useViewStore((s) => s.zoomInCamera);
  const zout = useViewStore((s) => s.zoomOutCamera);
  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-70 transition-opacity hover:opacity-100">
      <div className="flex flex-col rounded border border-outline-variant/30 bg-surface-container-highest backdrop-blur-md">
        <HudButton icon="add" title="放大" onClick={zin} />
        <div className="h-px w-full bg-outline-variant/30" />
        <HudButton icon="remove" title="缩小" onClick={zout} />
        <div className="h-px w-full bg-outline-variant/30" />
        <HudButton icon="fit_screen" title="适配视图" onClick={fit} />
      </div>
    </div>
  );
}

function HudButton({ icon, title, onClick }: { icon: string; title: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

/** 视口左下角：当前对象 ID 贴 */
export function ObjectIdBadge() {
  const kind = useModelStore((s) => s.kind);
  const geometry = useModelStore((s) => s.geometry);
  const selected = useViewStore((s) => s.selectedRebarId);
  const label = selected
    ? selected
    : `${kind.toUpperCase()}-A4 · ${geometry.meta["构件"] ?? ""}`;
  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded border border-outline-variant/50 bg-surface-container-lowest/80 px-3 py-1.5 backdrop-blur-md">
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      <span className="text-label-sm uppercase tracking-wider text-on-surface">{label}</span>
    </div>
  );
}
