# 应用化 UI Kit

`ui-kits` 不是静态展示板，也不是把几个页面并排摆着装完整。它的职责是把 copero 设计系统落到真实产品表面，并提供可继续拼装的模块化入口。

## Applied kit structure


- `components/`：模块化 HTML 片段目录，给后续代理复用
- `components.html`：核心组件浏览页
- `homepage-shell.html`：提炼自源项目的首页壳层
- `career-card.html`：品牌组件“职业结果卡”单独审查页
- `content-stream.html`：攻略与内容流页面示例

## Usage workflow

1. 先读 `../../DESIGN.md`，确认你没有把它做成 SaaS 或新闻站。
2. 在新页面中先加载 `../../colors_and_type.css`。
3. 优先从 `components/` 里复用模块，再决定是否引用 `components.html`、`career-card.html`、`content-stream.html` 中的完整段落。
4. 组合完成后，回到 `../../preview/` 对颜色、排版、间距、按钮和品牌资产做聚焦审查。

## Design notes

- 主视觉重心必须仍然是 Hero 或职业结果卡，而不是功能列表。
- 按钮、语言切换、状态行和攻略卡都要保留真实产品语义。
- 允许扩展新页面，但不允许抹掉多语言入口、状态约束和 CTA 主线。
- hover 要轻，focus-visible 要清楚，别加一堆花哨特效把页面搞脏。

## Source basis

本 applied kit 的结构直接来源于：
- `../../landing.html`
- `../../source_examples/landing-source.html`
- `../../critique.json`

如果你对某个模块是否“像 copero”没把握，先回看源页面，而不是自作聪明脑补一个新风格。
