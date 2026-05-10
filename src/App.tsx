import BeamScene from './scene/BeamScene';
import ParamPanel from './ui/ParamPanel';
import Toolbar from './ui/Toolbar';
import ErrorBoundary from './ui/ErrorBoundary';
import { useState } from 'react';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-900 text-slate-100">
      <Toolbar />
      <div className="relative flex flex-1 overflow-hidden">
        {/* 移动端：抽屉式开关 */}
        <button
          className="absolute left-3 top-3 z-20 md:hidden rounded bg-slate-800/90 px-2 py-1 text-xs ring-1 ring-slate-700"
          onClick={() => setPanelOpen((v) => !v)}
        >
          {panelOpen ? '隐藏面板' : '显示面板'}
        </button>

        <aside
          className={`${
            panelOpen ? 'translate-x-0' : '-translate-x-full'
          } absolute md:static z-10 h-full w-[320px] shrink-0 border-r border-slate-700 bg-slate-900/95 transition-transform md:translate-x-0`}
        >
          <ParamPanel />
        </aside>

        <main className="relative flex-1 min-w-0">
          <ErrorBoundary>
            <BeamScene />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
