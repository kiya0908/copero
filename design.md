@GitHub https\://github.com/kiya0908/copero

请直接连接并完整检查这个 GitHub 仓库。

我现在要对这个 Copero 游戏网站进行一次前端架构和 UI 重构。这个任务不是从零重写游戏，也不是简单把 Open Design 生成的 HTML 复制成页面。
这次优先保证架构正确和可维护性，不要求一次提交完成全部重构，可以按阶段提交。

在开始修改代码之前，请先完整阅读：

1. 当前 React + Vite + TypeScript 项目结构
2. src/ 下现有页面、组件、游戏阶段组件
3. src/engine/ 下的游戏逻辑
4. src/data/ 下的游戏数据
5. 当前存档、本地状态、analytics 等实现
6. design-reference/ 下全部设计参考文件

重点阅读：

design-reference/
├── DESIGN.md
├── SKILL.md
├── colors_and_type.css
├── context/provenance.md
├── assets/
├── source/
│   ├── landing-source.html
│   └── entry-source.html
└── ui-kit/
├── README.md
├── homepage-shell.html
├── career-card.html
├── components.html
├── content-stream.html
└── components/

### 项目目标
最终网站需要：

- React + Vite + TypeScript
- 可以部署到 Cloudflare
- 组件化、可维护、可继续扩展
- 首页和完整游戏全部支持多语言
- 支持：
  - 西班牙语 es
  - 英语 en
  - 简体中文 zh-cn
- 使用基于 URL 的语言路由：
  /es/
  /en/
  /zh-cn/

游戏页面也使用对应语言路径，例如：

/es/game
/en/game
/zh-cn/game

后续可以增加更多页面，因此路由、组件和 i18n 架构必须具备扩展性。

### 非常重要：禁止静态HTML业务页面

这个项目绝对不允许重新出现手工维护的静态 HTML 业务页面。

除了 Vite 本身必需的根 index.html 挂载入口之外：

禁止：

- home.html
- game.html
- en/index.html 手工页面
- es/index.html 手工页面
- zh-cn/index.html 手工页面
- iframe 加载 Open Design HTML
- dangerouslySetInnerHTML 注入 Open Design HTML
- 把 design-reference 中 HTML 放进 public 作为真实页面
- 直接复制整份 HTML 作为运行时页面

design-reference/**/*.html 只能作为视觉、布局、组件和交互参考。

最终网站页面必须由：

React Components
+
i18n resources
+
正式 CSS / Tailwind / design tokens
+
React Router

组成。

允许在 build 阶段为了 SEO 自动预渲染 HTML，但这些 HTML 必须由 React 页面自动生成，不能人工维护。

### open design的使用规则

Open Design 给出的设计稿不是产品需求文档，也不是最终内容来源。

它主要用于参考：

- 颜色
- Typography
- 间距
- 圆角
- 卡片
- 按钮
- Header
- Hero
- Career Result Card
- 内容卡片
- 状态组件
- 动效
- 响应式布局
- 整体视觉语言

设计系统核心视觉方向：

- 深蓝黑背景
- 荧绿作为主要 CTA / active / positive 状态
- 金色用于奖杯、荣誉、高价值状态
- 粗 display 标题
- system body font
- mono 用于结构数据和数字
- Career Result Card 是重要品牌组件
- Hover 动效短且克制
- focus-visible 必须完整
- Empty / Loading / Error 状态不能忽略

但是必须注意：

Open Design 原型里的以下内容不可信，不能直接复制：

- 中文文案
- GoalSaga 等名称
- 原型自己虚构的首页内容
- “为什么会火”等不一定适用于实际网站的区块
- PT-BR / IT 等语言
- 虚构用户数据、社区数据、热度数据
- 与当前 Copero 游戏玩法不一致的介绍
- 未确认的品牌 Logo 或品牌资产

最终品牌是 Copero / copero.top。

设计稿中的文案只用来理解视觉长度和信息层级，不能作为最终产品文案。

### 首页内容要求

首页不能按照 Open Design 原型中文内容直接翻译。

请首先根据当前仓库中真实的游戏玩法，重新确定首页信息架构。

首页主要目标：

1. 让第一次进入网站的人快速理解 Copero 是什么
2. 快速开始游戏
3. 解释核心游戏玩法
4. 展示真实游戏机制和结果
5. 给 SEO 提供足够且准确的文本内容
6. 为三语言页面提供一致的信息结构
7. 不虚构官方关系、用户数量、热度、评分等信息

首页可以参考 Open Design 的视觉组织方式，例如：

- Header
- Hero
- Primary CTA
- 游戏玩法步骤
- 游戏核心机制
- Classic / Purist 模式
- Career / Result Card 展示
- 游戏特色
- FAQ
- Footer

但具体区块必须根据真实游戏内容决定。

如果 Open Design 中存在不适合这个项目的区块，不要为了“还原设计稿”强行保留。

### 完整游戏国际化

这次不是只做首页 i18n。

完整游戏都必须支持：

- es
- en
- zh-cn

包括但不限于：

- Intro
- Identity
- Draft
- Draft Result
- Origin Club
- Career
- Club Offers
- Contract Negotiation
- Career Choices
- National Team Call-up
- Trait Selection
- Youth Loan
- Season Result
- Trophy Celebration
- Retirement
- Career Summary
- Share / Restart
- Loading
- Empty
- Error
- Disabled
- Toast /提示

不要简单地在 JSX 中留下硬编码的西班牙语。

建议使用：

i18next
react-i18next

i18n 文件需要按职责拆分，例如：

src/i18n/
├── config.ts
└── locales/
├── es/
│   ├── common.json
│   ├── home.json
│   ├── game.json
│   ├── events.json
│   └── seo.json
├── en/
│   ├── common.json
│   ├── home.json
│   ├── game.json
│   ├── events.json
│   └── seo.json
└── zh-cn/
├── common.json
├── home.json
├── game.json
├── events.json
└── seo.json

具体结构可以根据项目实际情况优化，不要求机械照搬。

### 游戏 Engine 与 i18n 必须解耦

这是本次重构的重要原则。

游戏引擎尽量只保存：

- 状态
- 数据
- 数值
- IDs
- translation keys
- template params

不要让 engine 负责生成已经翻译好的完整句子。

错误示例：

event.body = "Has recibido una oferta del Real Madrid"

更合理：

event.messageKey = "career.offer.received"
event.params = {
clubName: ...
}

然后由 React UI 根据当前 locale：

t(event.messageKey, event.params)

完成展示。

请检查当前 engine 中有没有直接生成大量西班牙语内容。

如果有，请逐步把“游戏逻辑”和“展示文案”解耦。

但是：

不要因为国际化而改变现有游戏玩法、概率、数值和平衡规则。

### 存档必须跨语言共享

同一个游戏存档不能因为语言变化而变成不同存档。

例如：

用户在：

/es/game

开始游戏，

切换到：

/en/game

之后应该继续同一职业生涯。

因此：

- LocalStorage / save state 不应该以 locale 作为不同存档 key
- 存档中尽量不要保存已经翻译后的完整句子
- 保存原始数据 / IDs / event key / params
- 页面展示时再根据 locale 翻译

### 实体名称国际化规则

原则：

真实球员姓名：
不要翻译

俱乐部正式名称：
一般保留正式名称

国家名称：
本地化

足球位置：
本地化

游戏 Trait：
本地化

游戏状态：
本地化

奖杯 / 比赛：
根据现有数据和实际语义决定是否本地化

金额、日期、数字：
尽可能使用 Intl.NumberFormat / Intl.DateTimeFormat，根据当前 locale 格式化。


### 组件架构

这次重构需要提高复用性。

不要为每个页面重复创建：

- Button
- Card
- Badge
- Tag
- Modal
- Header
- LanguageSwitcher
- Result Card
- Stat Item
- Section Heading
- Loading
- Empty
- Error
- Form Field

请建立清晰的公共组件层。

建议方向：

src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   └── NotFoundPage.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── marketing/
│
├── features/
│   └── game/
│       ├── phases/
│       ├── components/
│       └── hooks/
│
├── engine/
├── data/
├── i18n/
└── styles/

这只是建议，不要求为了目录漂亮而大规模搬迁没有必要的代码。

重点是职责清晰。

### 现有游戏逻辑处理原则

当前仓库已经有完整 React 游戏流程。

请优先保留：

src/engine/
src/data/
analytics
save/load
游戏概率
属性计算
career simulation
transfer
contract
national team
draft
season simulation

不要把这个任务做成游戏玩法重写。

现有：

IntroPhase
IdentityPhase
DraftPhase
DraftResultPhase
OriginPhase
CareerPhase
SummaryPhase

可以重构 UI 和组件组织，但游戏行为和用户流程应保持。

如果为了 i18n 必须调整 engine 数据结构，可以修改，但需要确保：

- 游戏流程不回归
- 保存恢复正常
- 旧存档尽量兼容
- game flow smoke test 继续通过

### 设计token

不要让正式网站直接依赖：

design-reference/colors_and_type.css

这个文件只能作为设计参考。

应该把最终确认的 token 整理到正式代码，例如：

src/styles/tokens.css
src/styles/globals.css
src/styles/animations.css

或者等效结构。

也就是说：

design-reference/
可以整个删除，正式网站仍然必须正常运行。

这也是验收条件之一。

### seo与多语言url

三个语言版本必须拥有独立 URL：

/es/
/en/
/zh-cn/

需要支持：

- html lang
- localized title
- localized meta description
- canonical
- hreflang
- x-default
- Open Graph
- sitemap
- robots
- structured data

不要让三个语言 URL 输出完全相同的 metadata。

========================================
hreflang / canonical 默认规则
========================================

首页语言关系：

https://copero.top/es/
https://copero.top/en/
https://copero.top/zh-cn/

x-default 指向：

https://copero.top/es/

根路径 https://copero.top/ 不作为独立语言内容页，
它只负责跳转到 /es/。

每个语言页面 canonical 指向自身：

/es/ → canonical /es/
/en/ → canonical /en/
/zh-cn/ → canonical /zh-cn/

hreflang 至少包含：

es
en
zh-CN
x-default

其中 x-default 指向西班牙语版本 /es/。

首页允许构建阶段预渲染。

游戏进行中的动态状态不需要为了 SEO 强行预渲染。

不要让搜索引擎索引随机生成的大量游戏状态 URL。

### 语言切换

LanguageSwitcher 应该：

- ES
- EN
- 中文

========================================
多语言默认规则与根路径
========================================

默认语言明确设为：

es（西班牙语）

根路径：

/

必须直接跳转到：

/es/

不要根据浏览器语言自动决定根路径跳转目标。

也就是说：

/ → /es/

这是固定产品规则。

支持的语言只有：

- es
- en
- zh-cn

有效首页路由：

/es/
/en/
/zh-cn/

有效游戏路由：

/es/game
/en/game
/zh-cn/game

如果 URL 中不存在 locale，或者用户直接访问根路径 /，默认进入西班牙语版本。

LanguageSwitcher 切换语言时应该保留用户当前页面，例如：

/es/game
→ 切换 EN
→ /en/game

/zh-cn/
→ 切换 ES
→ /es/

URL 中的 locale 永远是当前页面语言的最高优先级。

不要出现以下行为：

- 访问 /en/ 后因为浏览器是中文而自动切成 /zh-cn/
- 访问 / 后根据浏览器语言随机跳转
- 在同一个 URL 下仅靠 localStorage 切换语言
- 三种语言共用 / 而没有独立 URL

用户可以将语言选择保存到 localStorage 作为体验偏好，但该偏好不能覆盖明确的 URL locale。

### 响应式

必须同时保证：

- desktop
- tablet
- mobile

特别检查：

- Hero
- Header
- language switcher
- Draft cards
- Club offer cards
- Contract negotiation
- Career result
- Summary
- long translated text

不能只按照中文原型长度开发。

英语、西班牙语通常比中文更长，需要提前预留。

不要通过非常小的字体解决文本溢出。

### 执行方式

不要直接一上来大规模修改代码。

第一步：

先完整审查：

- 当前项目结构
- 当前游戏流程
- 当前硬编码文本
- Open Design 参考
- 当前 UI 组件
- 当前 Router
- 当前 SEO
- 当前 save state

然后给出一个简洁的实施计划，明确：

Phase 1：
架构 / router / i18n 基础

Phase 2：
Design tokens + 全局公共组件

Phase 3：
三语言首页

Phase 4：
完整游戏 UI 国际化

Phase 5：
Open Design 风格覆盖游戏组件

Phase 6：
SEO / hreflang / prerender

Phase 7：
mobile + regression + build validation

确认计划合理后，直接开始实施，不需要因为普通实现细节反复询问我。

如果存在会改变产品行为的重要决策，再向我确认。

### 完成标准

最终至少需要满足：

1. npm install 正常
2. npm run lint 正常
3. npm run build 正常
4. 现有 game flow smoke test 正常
5. /es/ 正常
6. /en/ 正常
7. /zh-cn/ 正常
8. 三种语言都能完整开始并完成游戏
9. 游戏中没有大面积硬编码西班牙语
10. 切换语言不丢存档
11. Open Design HTML 没有成为业务页面
12. design-reference 删除后网站运行不受影响
13. 公共组件没有大量重复实现
14. mobile 下完整可玩
15. 首页内容与真实 Copero 游戏玩法一致
16. 不出现 GoalSaga、PT-BR、IT 等 Open Design 原型残留内容
17. 不虚构用户数量、热度、评分或官方关系

开始之前先阅读整个仓库和 design-reference，再给出你的实施判断，然后开始改。