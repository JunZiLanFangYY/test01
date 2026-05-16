import { useRef } from "react";
import * as THREE from "three";
import { Scene } from "./three/components/Scene";
import { exportGLTF, exportPNG } from "./three/exporters";
import { TopHeader } from "./ui/TopHeader";
import { LeftNav } from "./ui/LeftNav";
import { RightInspector } from "./ui/RightInspector";
import { CameraHUD, ObjectIdBadge, ViewToolsHUD } from "./ui/CanvasHUD";
import { SectionView } from "./ui/SectionView";
import { QuantityTable } from "./ui/QuantityTable";

export default function App() {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-container-lowest font-sans text-on-surface antialiased">
      <TopHeader
        onExportPNG={() => glRef.current && exportPNG(glRef.current)}
        onExportGLTF={() => sceneRef.current && exportGLTF(sceneRef.current)}
      />

      <div className="relative mt-16 flex h-[calc(100vh-64px)] w-full flex-1">
        <LeftNav />

        {/* Center Canvas Area */}
        <main className="relative ml-64 mr-80 flex h-full flex-1 flex-col bg-surface-container">
          {/* 3D Viewport */}
          <div className="group relative flex-[1.5] overflow-hidden bg-surface-dim">
            {/* subtle grid behind 3D, the canvas is fully opaque so this only shows in edges */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(66,71,84,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(66,71,84,0.06) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <Scene
              onReady={(gl, scene) => {
                glRef.current = gl;
                sceneRef.current = scene;
              }}
            />
            <ViewToolsHUD />
            <CameraHUD />
            <ObjectIdBadge />
          </div>

          {/* Bottom Data Panel */}
          <div className="flex flex-[1] overflow-hidden border-t border-outline-variant/30 bg-surface-container-lowest">
            <SectionView />
            <QuantityTable />
          </div>
        </main>

        <RightInspector />
      </div>
    </div>
  );
}
