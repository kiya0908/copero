---
name: copero-design-system
description: 足球人生模拟内容站的深色营销界面设计系统，包含 tokens、预览卡、源证据和应用化 UI kit。
user-invocable: true
---

# copero Design System Skill

## What is inside

- `DESIGN.md`：源证据支撑的系统总纲，覆盖产品上下文、视觉规则、颜色、字体、间距、布局、组件、动效、语气与反模式
- `colors_and_type.css`：可直接复用的颜色、字体、间距、容器、圆角与基础组件 token 包
- `preview/`：聚焦审查卡，分别验证颜色、排版、间距、按钮、组件、品牌资产与应用表面
- `source_examples/`：保留的高信号原始页面快照，供后续代理回看真实实现
- `assets/` 与 `build/`：从 HTML 证据恢复的徽章、字标与运行时图形资产
- `ui_kits/app/`：应用化界面 kit，提供模块化组件与组合入口

## Source context

本包不是凭空造牌子，它来自源项目 `copero` 的真实复制证据：
- `landing.html`：高保真响应式首页，提供核心 tokens、Hero、结果卡、内容流、状态区与 CTA
- `index.html`：原型入口页，确认主表面是 landing 体验
- `critique.json`：对清晰度、层级、排版、动效与品牌的复盘意见
- `context/source-context.md`：源项目 id、复制文件与生成契约

因此这套系统的默认产品姿态已经锁死：
- 深色足球内容站
- 荧绿主行动色
- 荣誉金强调
- 粗 display 标题 + 系统体正文 + mono 结构信息
- 目标是把用户送去试玩，而不是做企业介绍站

## When to use this skill

当任务满足以下任一条件时，优先使用本包：
- 足球题材内容站首页
- 模拟人生 / 模拟游戏营销页
- 需要结果卡、攻略流、状态区和多语言入口的响应式网页
- 需要强 CTA、强对比 Hero、社区传播感的内容产品界面
- 需要从现有 copero 视觉语言继续扩展，而不是另起一套品牌

## How to use

1. 先读 `DESIGN.md`，确认你没有把产品误判成 SaaS、新闻站或后台。
2. 引入 `colors_and_type.css`，先绑定 token 与基础排版，再落具体组件。
3. 先看 `preview/index.html`，按预览卡审查颜色、排版、间距、按钮和品牌资产。
4. 需要回到真实源项目时，直接读 `source_examples/landing-source.html`，不要靠记忆脑补。
5. 需要页面级复用时，从 `ui_kits/app/` 的模块和入口页拼装，而不是从零再画一遍。
6. 交付前自查三件事：主 CTA 是否清晰、结果卡是否仍是品牌重心、状态与多语言入口是否被保留。

## Design system highlights

- `career-card` 是品牌核心组件：路线徽章、球衣号、评分块、姓名、统计项和时间线共同表达“人生结果”
- 顶部导航、语言切换、攻略流和状态卡都来自 `landing.html` 的真实实现，不是抽象占位
- 色彩体系围绕深蓝黑、荧绿、荣誉金展开，禁止暖米色或多高饱和色乱入
- 交互坚持短 hover、清晰 focus-visible、真实 Empty / Loading / Error 状态
- 语气直接、有判断、偏足球社区传播，不写虚构官方数据或假热度
