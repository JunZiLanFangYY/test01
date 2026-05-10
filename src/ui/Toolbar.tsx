import { useBeamStore } from '../store/useBeamStore';
import { RoleColors, RoleLabels, type RebarRole } from '../colors';
import { exportPNG, exportGLB } from '../export/exporters';

export default function Toolbar() {
  const { view, setView } = useBeamStore();

  // 当前 MVP 已使用的角色
  const usedRoles: RebarRole[] = ['topThrough', 'bottomThrough', 'supportNegative1', 'stirrup'];

  return (
    <div className="flex items-center gap-4 border-b border-slate-700 bg-slate-900/80 px-4 py-2 backdrop-blur">
      <h1 className="text-sm font-semibold text-slate-100">3D 框架梁(KL)平法可视化</h1>

      <div className="h-5 w-px bg-slate-700" />

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <span>混凝土透明度</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(view.concreteOpacity * 100)}
          onChange={(e) => setView({ concreteOpacity: Number(e.target.value) / 100 })}
          className="w-32 accent-sky-500"
        />
        <span className="w-8 tabular-nums text-right">{Math.round(view.concreteOpacity * 100)}%</span>
      </label>

      <button
        className={`text-xs px-2 py-1 rounded ring-1 ring-slate-700 ${
          view.concreteOpacity < 0.05 ? 'bg-sky-600' : 'bg-slate-800 hover:bg-slate-700'
        }`}
        onClick={() =>
          setView({ concreteOpacity: view.concreteOpacity < 0.05 ? 0.35 : 0 })
        }
      >
        {view.concreteOpacity < 0.05 ? '显示混凝土' : '隐藏混凝土'}
      </button>

      <button
        className={`text-xs px-2 py-1 rounded ring-1 ring-slate-700 ${
          view.wireframe ? 'bg-sky-600' : 'bg-slate-800 hover:bg-slate-700'
        }`}
        onClick={() => setView({ wireframe: !view.wireframe })}
      >
        线框
      </button>

      <button
        className={`text-xs px-2 py-1 rounded ring-1 ring-slate-700 ${
          view.showRebar ? 'bg-sky-600' : 'bg-slate-800 hover:bg-slate-700'
        }`}
        onClick={() => setView({ showRebar: !view.showRebar })}
      >
        {view.showRebar ? '隐藏钢筋' : '显示钢筋'}
      </button>

      <div className="h-5 w-px bg-slate-700" />

      <button
        className="text-xs px-2 py-1 rounded ring-1 ring-slate-700 bg-slate-800 hover:bg-slate-700"
        onClick={() => exportPNG('beam.png')}
      >
        截图 PNG
      </button>
      <button
        className="text-xs px-2 py-1 rounded ring-1 ring-slate-700 bg-slate-800 hover:bg-slate-700"
        onClick={() => exportGLB('beam.glb')}
      >
        导出 GLB
      </button>

      <div className="h-5 w-px bg-slate-700" />

      <div className="flex items-center gap-3 text-xs">
        {usedRoles.map((r) => (
          <span key={r} className="flex items-center gap-1 text-slate-300">
            <span
              className="inline-block h-3 w-3 rounded-sm ring-1 ring-slate-600"
              style={{ background: RoleColors[r] }}
            />
            {RoleLabels[r]}
          </span>
        ))}
      </div>
    </div>
  );
}
