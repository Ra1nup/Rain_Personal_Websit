---
title: "Hello World: 你好，我是 Rain"
pubDate: 2026-02-10
description: "关于我，以及我是如何用 Astro + React + Supabase 构建这个无服务架构网站的。"
author: "Rain"
heroImage: "../../assets/blog/hello-world.png"
tags: ["Thoughts", "Tech", "Astro", "FullStack"]
---

## 👋 你好，世界

欢迎来到 **Ra1nup.top**，这是我在互联网上搭建的一个小小的数字花园。我是 **Rain
(Qi
Kang)**，一名即将毕业的计算机科学与技术专业大四学生。在这个充斥着算法推荐和碎片化信息的时代，我一直希望能拥有一个完全属于自己的角落。在这里，不需要迎合流量，只需要记录我对技术的探索、对生活的观察以及那些灵光一现的瞬间。

### 关于我：不止于代码

虽然我的专业是 CS，但我不仅仅是一个只会写代码的 Developer。我更愿意称自己为
**"Creator" (创造者)**。

- **技术狂热**：我热衷于前端交互（React, Three.js, WebGL）和 AI
  应用开发。我喜欢把冷冰冰的代码变成绚丽的 3D 视觉效果，或者用 AI 让创意落地。
- **光影猎手**：代码之外，我是一名摄影和剪辑爱好者。我习惯用镜头捕捉生活的纹理，无论是街头的瞬间还是精心设计的构图。
- **多元兴趣**：当我不盯着工作时，我可能在《英雄联盟》里玩海克斯大乱斗，或者在听
  NewJeans 的歌单。

## 🛠️ 这个网站是如何搭建的？

既然是技术博客，第一篇文章当然要聊聊“网站本身”。为了追求极致的性能和开发体验，我没有选择
WordPress 或 Hexo，而是采用了一套现代化的 **Jamstack** 架构：**Astro + React +
Supabase**。

### 1. 框架：为什么是 Astro?

作为一个对性能有执念的前端开发者，Astro 的 **"Island Architecture" (群岛架构)**
深深吸引了我。

不同于 Next.js 的全量 Hydration，Astro 默认输出纯 HTML（0
JavaScript），只有在需要交互的组件（比如底部的评论区）时，才会按需加载脚本。这保证了
**ra1nup.top** 即使在弱网环境下也能秒开。

### 2. 后端：Serverless 的力量

我不想把时间浪费在维护一台 Linux 服务器和 MySQL 数据库上。因此，我选择了
**Supabase** (BaaS)。

- **Database**: 使用 Supabase 的 PostgreSQL 数据库。
- **Security**: 利用 **RLS (Row Level Security)** 策略，我不需要写后端 API
  接口，直接在前端就能安全地读写数据库。
- **Auth**: 匿名评论功能就是基于 Supabase 的 Auth 机制实现的。

### 3. 交互：React + 递归组件

你现在看到的评论区，其实是一个 **React 组件**。

为了实现“楼中楼”的无限嵌套回复，我在前端编写了一个将扁平数组转化为树形结构（Tree
Data Structure）的算法，并使用了 **递归组件 (Recursive Component)**
的写法。这让我在静态网站里也能拥有像 Reddit 一样丝滑的动态交互体验。
