# 3D 钢筋平法可视化

纯前端、参数化的钢筋混凝土构件三维可视化工具，支持 **柱 (KZ) / 梁 (KL) / 板 (LB)**，依据 **22G101** 自动计算锚固长度、弯钩与箍筋加密区。

## 技术栈

- Vite + React 18 + TypeScript
- three.js + @react-three/fiber + @react-three/drei
- Zustand 状态管理
- Tailwind CSS UI
- Vitest 单元测试（22G101 规则）

## 启动

```bash
npm install
npm run dev
```

访问 `http://localhost:5173`。

## 功能

- **参数化建模**：左侧面板修改截面/配筋参数，3D 模型实时更新
- **22G101 自动计算**：`laE`、弯钩 15d、柱顶/底加密、梁加密区长度、板支座锚固
- **真实管状几何**：钢筋折点带圆弧（半径 = 弯弧内径 + d）
- **交互**：点选钢筋查看属性、爆炸图、X/Y/Z 三向剖切、隐藏混凝土
- **导出**：PNG 截图、GLB 模型

## 项目结构

```
src/
  domain/                 纯 TS 领域层
    codes/22G101.ts       平法规则与查表
    members/              柱/梁/板几何生成器
    types.ts
  three/                  three.js 渲染层
    geometry/rebarCurve.ts 折线 → 圆角 CurvePath → TubeGeometry
    components/           Scene, ConcreteMesh, RebarTube
    exporters/            PNG / GLTF
  store/                  Zustand
  ui/                     参数面板、工具栏、属性卡
```

## 测试

```bash
npm run test
```

## 已知限制（MVP 范围）

- 柱：单层独立柱，未实现搭接/机械连接位置；节点核心区箍筋未单独处理
- 梁：单跨简支，未实现连续梁通长筋通过中间支座的搭接、不平整顶/变截面
- 板：矩形板，未实现温度筋、洞口附加筋
- 弯钩使用 90° 弯折近似（柱顶纵筋）/ 135° 沿对角线方向（箍筋）
- 弯弧采用三点 CatmullRom 拟合，足够视觉真实但非严格圆弧
