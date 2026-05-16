import { useModelStore, type MemberKind } from "@/store/useModelStore";
import { Icon } from "./Icon";

interface ModuleItem {
  key: MemberKind | string;
  label: string;
  icon: string;
  enabled: boolean;
}

const MODULES: ModuleItem[] = [
  { key: "beam", label: "Beams 梁", icon: "reorder", enabled: true },
  { key: "wall", label: "Walls 墙", icon: "view_quilt", enabled: false },
  { key: "column", label: "Columns 柱", icon: "view_column", enabled: true },
  { key: "slab", label: "Slabs 板", icon: "dashboard", enabled: true },
  { key: "stair", label: "Stairs 楼梯", icon: "stairs", enabled: false },
];

export function LeftNav() {
  const kind = useModelStore((s) => s.kind);
  const setKind = useModelStore((s) => s.setKind);
  return (
    <nav className="fixed left-0 top-16 z-40 flex h-[calc(100vh-64px)] w-64 flex-col border-r border-outline-variant/20 bg-surface-container-low/90 py-panel-gap backdrop-blur-lg">
      <div className="mb-6 flex items-center gap-3 px-gutter">
        <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary-container/20">
          <Icon name="apartment" fill className="text-primary" />
        </div>
        <div>
          <h2 className="text-headline-md font-bold leading-tight text-on-surface">Project Alpha</h2>
          <p className="text-label-md text-on-surface-variant">22G101 · Phase 1</p>
        </div>
      </div>

      <div className="mb-6 px-gutter">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-primary/30 bg-primary/10 py-2 text-label-md text-primary transition-colors hover:bg-primary/20">
          <Icon name="add" size={16} /> 新建预设
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-compact-padding">
        {MODULES.map((m) => {
          const active = m.enabled && kind === m.key;
          return (
            <button
              key={m.key}
              disabled={!m.enabled}
              onClick={() => m.enabled && setKind(m.key as MemberKind)}
              className={`group flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-all ${
                active
                  ? "border-r-2 border-primary bg-primary-container/20 text-primary"
                  : m.enabled
                    ? "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                    : "cursor-not-allowed text-outline-variant/60"
              }`}
            >
              <Icon
                name={m.icon}
                fill={active}
                className={active ? "translate-x-1" : "duration-300 group-hover:translate-x-1"}
              />
              <span className={`text-label-md ${active ? "font-bold" : ""}`}>{m.label}</span>
              {!m.enabled && (
                <span className="ml-auto rounded-sm bg-outline-variant/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-outline">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 px-compact-padding pt-4">
        <button className="group flex w-full items-center gap-3 rounded px-3 py-2 text-left text-on-surface-variant transition-all hover:bg-surface-variant/50 hover:text-on-surface">
          <Icon name="help" size={18} />
          <span className="text-label-md">Support</span>
        </button>
        <button className="group flex w-full items-center gap-3 rounded px-3 py-2 text-left text-on-surface-variant transition-all hover:bg-surface-variant/50 hover:text-on-surface">
          <Icon name="smart_toy" size={18} />
          <span className="text-label-md">AI Copilot</span>
        </button>
      </div>
    </nav>
  );
}
