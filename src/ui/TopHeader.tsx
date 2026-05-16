import { Icon } from "./Icon";

interface Props {
  onExportPNG: () => void;
  onExportGLTF: () => void;
}

export function TopHeader({ onExportPNG, onExportGLTF }: Props) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/20 bg-surface-container/80 px-gutter backdrop-blur-xl">
      <div className="flex items-center gap-container-padding">
        <h1 className="flex items-center gap-2 text-headline-md font-bold tracking-tight text-primary">
          <Icon name="architecture" fill />
          RebarVis 3D
        </h1>
        <div className="relative hidden md:block">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant"
          />
          <input
            type="text"
            placeholder="搜索参数、构件 ID..."
            className="w-64 rounded-full border border-outline-variant/30 bg-surface-dim py-1.5 pl-9 pr-4 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <HeaderIconButton icon="layers" label="layers" />
        <HeaderIconButton icon="download" label="导出 PNG" onClick={onExportPNG} />
        <HeaderIconButton icon="share" label="导出 GLB" onClick={onExportGLTF} />
        <HeaderIconButton icon="settings" label="settings" />
        <div className="ml-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant/30 bg-surface-variant">
          <Icon name="person" fill className="text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}

function HeaderIconButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="group flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
    >
      <Icon name={icon} className="group-hover:hidden" />
      <Icon name={icon} fill className="hidden group-hover:block" />
    </button>
  );
}
