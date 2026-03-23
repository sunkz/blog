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

## 二、触发机制

知道了 skill 是什么，接下来的问题是：它怎么被激活？

### 语义匹配决策

当用户发送消息时，模型会读取所有已注册 skill 的 `description`，将其与当前任务语义对比，决定是否调用 `Skill` 工具。这个决策是纯语言模型行为——没有正则匹配，没有关键词过滤，就是模型读懂了 description 描述的使用场景，再看当前任务是否符合。

以 `brainstorming` skill 的 description 为例：

> "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior."

当你说"帮我加个新功能"，模型识别出这是"adding functionality"，触发条件命中，调用 Skill 工具加载完整内容。

### "1% 原则"的真相

你可能听说过一条规则："只要有 1% 的可能 skill 适用，就必须触发。"这条规则听起来像是平台层的硬性逻辑，实际上它是 `using-superpowers` 这个**元 skill** 中写死的一条提示指令：

> "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill."

它的作用是通过强语义措辞（ABSOLUTELY MUST）把模型的触发阈值调低——宁可误触发，不可漏触发。这是提示工程的手段，不是代码级的拦截逻辑。理解这一点很重要：skill 系统的所有"强制性"，根本上都来自语言本身的约束力。

### Description 的写法影响触发准确性

写 skill 的人需要认真对待 description 的措辞。精心设计的 description 通常包含两个部分：

```
TRIGGER when: [明确的触发场景]
DO NOT TRIGGER when: [明确的排除场景]
```

例如 `claude-api` skill 的 description：

> "TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`...
> DO NOT TRIGGER when: code imports `openai`/other AI SDK..."

明确的边界描述让模型在模糊情况下也能做出正确判断。

## 三、上下文注入与优先级

Skill 被触发后，它的 body 内容会被加载进当前会话的上下文——具体来说，是 **system prompt 层**，而不是对话历史层。

这个位置很关键。在 LLM 的注意力机制中，system prompt 的语义权重通常高于用户消息。这意味着 skill 中的指令不是软性建议，而是模型在生成回复时会优先参考的约束框架。这就是为什么 skill 能够可靠地改变模型行为，而不仅仅是"供参考"。

### 纵向优先级体系

Skill 在整个指令体系中处于中间层：

```
用户显式指令（CLAUDE.md、对话中的直接要求）
        ↓ 高于
Skill 指令（动态加载的领域规则）
        ↓ 高于
模型默认行为（训练内化的通用行为模式）
```

这意味着如果你在 CLAUDE.md 中写了"不要使用 TDD"，即使某个 skill 要求 TDD，模型也会遵循你的显式指令。Skill 是对默认行为的覆盖，但不能覆盖用户的主动意图。

### 两种"优先级"不要混淆

这里有一个常见的概念混淆需要澄清：**"谁说了算"的纵向优先级**和**"执行顺序"的横向优先级**是完全不同的两件事。

- **纵向优先级**：当用户指令与 skill 指令冲突时，谁赢（答案：用户赢）
- **横向执行顺序**：当多个 skill 都应该被调用时，先调哪个（答案：process skill 先于 implementation skill）

第二种优先级将在 Skill 组合一节中详细讨论。
