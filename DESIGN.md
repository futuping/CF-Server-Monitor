# Vue 界面

基础组件来自 [shadcn-vue 官方注册表](https://www.shadcn-vue.com/docs/components)。项目保留 Vue 3，使用 New York 组件、Neutral 配色、Tailwind CSS 4 和 Lucide 图标。组件源码及其 MIT 许可证在 `src/frontend/components/ui/`，注册表配置在 `components.json`。

- 调整基础色、圆角和实时指标语义色：编辑 `src/frontend/styles/shadcn.css`。明暗主题切换在文档根节点进行，因此弹窗和浮层也会切换。
- 组合组件：从 `@/components/ui/<name>` 导入，可通过组件的 `variant`、`size` 和 `class` 调整实例。添加组件时使用项目的 Nix 环境，在仓库根目录运行 `direnv exec . npm exec --package=shadcn-vue -- shadcn-vue add <name>`。
- 仪表环、延迟采样格、地图及历史曲线是项目专用的数据展示。它们继续使用监控数据与原有绘图库；相关布局在 `monitor-layout.css`。可选的 Mikus 主题资源独立在 `mikus.css`。
- 发布前运行 `direnv exec . npm run test:all` 和 `direnv exec . npm run build:frontend`；在浏览器中验证总览视图、详情、登录、设置及对话框。
