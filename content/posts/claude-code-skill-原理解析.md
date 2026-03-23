---
title: "Claude Code Skill 是怎么工作的？一次调用的完整解剖"
date: 2026-03-23
---

你输入了一句："帮我写个新功能"。

往常，AI 会立刻开始写代码。但这一次不一样——它先停下来，问你目标读者是谁，又问了功能边界，然后提出三种技术方案供你选择，接着写了一份设计文档，还专门跑了一个子 agent 来审查这份文档……

你没有给出任何特别的指令。发生了什么？

答案是：一个 **skill** 被触发了。

Claude Code 的 skill 系统是一套让 AI 行为变得可预测、可重复、可定制的机制。它不是魔法，而是精心设计的工程。这篇文章将解剖一次完整的 skill 调用，把每一层运作原理都摊开来看。

## 一、Skill 文件的本质

先从最基础的问题入手：skill 是什么？

不是插件，不是脚本，不是工具调用——**skill 是结构化的 system prompt 片段**。它是一个 Markdown 文件，包含两部分：

**YAML frontmatter**（只有两个字段）：

```yaml
---
name: brainstorming
description: You MUST use this before any creative work - creating features,
  building components, adding functionality, or modifying behavior.
---
```

这里 `name` 是标识符，`description` 就是触发规则——模型靠读这段描述来判断当前任务是否需要激活这个 skill。没有单独的"触发配置"，description 本身就是触发逻辑。

**Markdown body**：skill 的实际指令内容，可以包含流程图、检查清单、禁止项、执行约束等任意结构。

### 三层上下文加载

这里有一个关键的架构设计——skill 不是全量加载的。Claude Code 把内容分成三层：

| 层次 | 内容 | 加载时机 |
|------|------|---------|
| 元数据层 | `name` + `description` | 始终在 context 中 |
| Body 层 | SKILL.md 完整正文 | 触发时动态加载 |
| 资源层 | `scripts/`、`references/`、`assets/` | 按需加载 |

这个设计解决了一个实际问题：如果把所有 skill 的全部内容都塞进 system prompt，context window 会被撑爆。三层架构让模型始终知道"有哪些 skill"，却只在真正需要时才加载完整内容。

### 存储位置

Skill 文件存放在 `~/.claude/plugins/` 目录下（或项目本地路径），按 `<publisher>/<name>/` 层级组织。Claude Code 启动时扫描这个目录，把所有 skill 的元数据（name + description）注册到 context，准备随时触发。
