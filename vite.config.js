var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// 部署到 GitHub Pages 时通过环境变量 VITE_BASE 注入 base，例如 "/rebar-kl-visualizer/"。
// 本地 dev / preview 默认使用 "/"。
export default defineConfig({
    plugins: [react()],
    base: (_a = process.env.VITE_BASE) !== null && _a !== void 0 ? _a : '/',
    server: { host: true, port: 5173 },
});
