---
title: "Rainup 个人网站"
tagline: "基于 Astro 5 + React 19 + Supabase 构建的高性能极简美学个人主页与博客系统"
category: "Web"
tags: [
  "Astro 5",
  "React 19",
  "Tailwind CSS v4",
  "Supabase",
  "TypeScript",
  "Motion",
]
role: "独立全栈设计与开发"
year: "Jan 2026 – Present"
status: "Live"
featured: true
order: 1
coverImage: "../../assets/projects/PersonalWeb.png"
demoUrl: "https://www.ra1nup.top/"
githubUrl: "https://github.com/Ra1nup/Rain_Personal_Websit"
---

## 💡 项目背景与初衷

在充斥着千篇一律模版和臃肿框架的 Web
时代，我希望打造一个**既有极致首屏性能，又具备现代苹果级（Apple-inspired）视觉质感与微交互动效**的个人数字花园。

这个网站不仅仅是一个静态展示页面，它集成了内容创作、实时数据交互与深浅色自适应体系，是我长期迭代与探索前沿前端技术的实践阵地。

## ✨ 核心特性与架构亮点

### 1. 极致加载速度：Astro 5 Islands 架构

- **零运行时 JS 负担**：绝大部分页面以纯 HTML/CSS 静态渲染，首屏无需加载笨重的
  SPA 运行时。
- **按需客户端水合 (Partial Hydration)**：仅在需要复杂交互的组件（如评论区
  `Comments`、阅读计数器 `ViewCounter` 和预加载动效）上激活 React 19
  客户端实例。

### 2. 视觉设计系统：Apple 磨砂玻璃质感

- **深浅色无缝自适应**：通过 Tailwind CSS v4 与精细调节的 CSS
  变量，文字、边框与光晕在深浅模式下均具备细腻平滑的色彩过渡。
- **微交互与毛玻璃 (Glassmorphism)**：吸顶导航栏、Bento Grid
  个人简介卡片与作品集卡片均融入高阶模糊滤镜与悬停视差光晕。

### 3. 无服务化后端 (BaaS)：Supabase 全面集成

- **高并发阅读量计数器**：利用 Supabase RPC
  存储过程原子递增文章浏览量，避免竞态冲突。
- **多层级嵌套评论区**：支持带防抖冷却、作者认证、展开收起与多层级回复的树状评论交互体系。

---

## 🛠️ 攻关难点与解决方案

> ### 难点 1：Tailwind CSS v4 在混合水合环境下的样式优先级
>
> **问题**：在 Astro 5 与 React 19 共同编译时，部分动态 ClassName
> 在客户端水合时可能存在样式覆盖延迟。
>
> **解决方案**：采用 `@tailwindcss/vite` 插件进行底层统一预编译，并在
> `global.css`
> 中提取语义化变量与自定义实用类，确保构建产物与运行时样式无缝对齐。

> ### 难点 2：无限嵌套评论在移动端视图的排版溢出
>
> **问题**：传统的递归嵌套评论在小屏幕手机上会因为多层 margin-left
> 导致文本被严重压缩。
>
> **解决方案**：设计了**拍平渲染算法（Flattened Render
> Tree）**，结合清晰的竖向回复指示线与 `@`
> 目标作者标签，在保持层级语义的同时大幅提升了移动端阅读体验。
