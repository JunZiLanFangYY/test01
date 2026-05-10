# 3D 框架梁(KL)平法可视化

纯前端、按 22G101 规则可视化单根框架梁（KL）的钢筋与混凝土，参数实时联动。

## 技术栈

- Vite + TypeScript + React 18
- three.js + @react-three/fiber + @react-three/drei
- zustand 状态管理
- TailwindCSS 面板/工具栏

## 本地开发

```powershell
npm install
npm run dev
```

启动后访问 http://localhost:5173

## 构建与部署

```powershell
npm run build
npm run preview
```

推送到 GitHub `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。  
请在仓库 `Settings → Pages` 中将"Source"切换为"GitHub Actions"。

## 当前进度（里程碑）

- [x] M1 脚手架（Vite + R3F + Tailwind + zustand + GH Pages CI）
- [x] M2 混凝土梁体（多跨参数化、PBR、透明度滑条）
- [x] M3 起步：上下通长筋（CatmullRom + TubeGeometry + HRB400 螺纹法线贴图）
- [ ] M4 箍筋 + 22G101 加密区计算 + InstancedMesh + 135° 弯钩
- [ ] M5 22G101 规范模块（laE 表、弯锚、错筋、腰筋/拉结筋）+ vitest
- [ ] M6 剖切、隐藏混凝土、明细表、点击高亮
- [ ] M7 PNG/GLTF 导出、移动端调优、上线

## 目录

```
src/
  codes/22g101/   # 规范计算（M5 起填充：laE/加密区/弯钩/弯弧）
  model/          # 参数 → BeamModel
  geometry/       # BeamModel → three 几何
  scene/          # R3F 场景组件
  ui/             # 参数面板 / 工具栏
  store/          # zustand
  colors.ts       # 钢筋按角色配色
  types.ts        # 共享类型
```
