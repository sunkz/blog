# Claude Code Skill 博客文章 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 git worktree 中写一篇约 2500 字的中文技术博客，深入解析 Claude Code Skill 的运作原理，发布到 Hugo 博客。

**Architecture:** 在独立的 git worktree 中创建博客 Markdown 文件，按照设计文档逐节撰写，最后验证 Hugo 构建通过后合并回主分支。

**Tech Stack:** Hugo 静态站点生成器、Markdown、Git worktree

---

## 文件映射

| 操作 | 路径 | 说明 |
|------|------|------|
| 创建 | `content/posts/claude-code-skill-原理解析.md` | 博客正文（约 2500 字） |

---

### Task 1: 创建 Git Worktree 并初始化博客文件

**Files:**
- Create: `content/posts/claude-code-skill-原理解析.md`（初始 frontmatter）

- [ ] **Step 1: 创建 worktree**

```bash
git worktree add .claude/worktrees/blog-claude-code-skill -b feat/claude-code-skill-blog
```

Expected: 在 `.claude/worktrees/blog-claude-code-skill/` 下创建独立工作目录

- [ ] **Step 2: 进入 worktree 目录**

```bash
cd .claude/worktrees/blog-claude-code-skill
```

- [ ] **Step 3: 创建博客文件并写入 frontmatter**

创建文件 `content/posts/claude-code-skill-原理解析.md`，内容如下：

```markdown
---
title: "Claude Code Skill 是怎么工作的？一次调用的完整解剖"
date: 2026-03-23
---
```

- [ ] **Step 4: 提交初始文件**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: init claude code skill blog post"
```

---

### Task 2: 撰写引子（~200字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：** 描述一个 skill 被触发的瞬间——用户输入一句话，AI 突然按照严格的流程执行。制造悬念："为什么 AI 突然变得如此精确？"

- [ ] **Step 1: 在文件末尾追加引子正文**

```markdown

你输入了一句："帮我写个新功能"。

往常，AI 会立刻开始写代码。但这一次不一样——它先停下来，问你目标读者是谁，又问了功能边界，然后提出三种技术方案供你选择，接着写了一份设计文档，还专门跑了一个子 agent 来审查这份文档……

你没有给出任何特别的指令。发生了什么？

答案是：一个 **skill** 被触发了。

Claude Code 的 skill 系统是一套让 AI 行为变得可预测、可重复、可定制的机制。它不是魔法，而是精心设计的工程。这篇文章将解剖一次完整的 skill 调用，把每一层运作原理都摊开来看。
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write blog intro section"
```

---

### Task 3: 撰写第一节——Skill 文件的本质（~400字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 说明 skill 本质是结构化的 system prompt 片段，不是插件或代码
- 精确描述 frontmatter 的两个字段：`name`（标识符）和 `description`（触发规则，即触发依据）
- 说明三层上下文加载架构：元数据层（始终在 context）/ body 层（触发时加载）/ 资源层（按需加载）
- 说明 skill 文件存储位置：`~/.claude/plugins/` 下按 `<publisher>/<name>/` 组织，Claude Code 启动时扫描并注册元数据

- [ ] **Step 1: 追加第一节正文**

```markdown

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

Skill 文件存放在 `~/.claude/plugins/` 目录下，按 `<publisher>/<name>/<version>/` 层级组织。Claude Code 启动时扫描这个目录，把所有 skill 的元数据（name + description）注册到 context，准备随时触发。
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write section 1 - skill file structure"
```

---

### Task 4: 撰写第二节——触发机制（~400字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 说明模型如何用 description 做语义匹配决策（调用 Skill 工具）
- 澄清"1% 原则"是 `using-superpowers` 元 skill 中的显式策略指令，不是平台内置逻辑
- 给出触发 vs 不触发的边界案例
- 说明 description 写法（TRIGGER when / DO NOT TRIGGER when 结构）对触发准确性的影响

- [ ] **Step 1: 追加第二节正文**

```markdown

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
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write section 2 - trigger mechanism"
```

---

### Task 5: 撰写第三节——上下文注入与优先级（~400字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 说明触发后 skill body 被注入 system prompt 层（不是对话历史层）
- 解释为什么 system prompt 层的语义权重更高
- 清晰说明纵向优先级：用户指令 > skill > 模型默认行为
- 特别说明：此优先级与"skill 之间的执行顺序"是完全不同的维度，不要混淆

- [ ] **Step 1: 追加第三节正文**

```markdown

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
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write section 3 - context injection and priority"
```

---

### Task 6: 撰写第四节——执行约束（~500字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 澄清 HARD-GATE 是 skill body 中的 XML 标记约定，通过强语义措辞（DO NOT、NEVER）实现约束效果，不是代码级运行时拦截
- 说明 Checklist → TodoWrite 机制：将执行状态外化为 UI 可见的 todo 项，防止模型在内部"跳过"步骤
- 对比：无 skill 时 AI 自主推断路径 vs 有 skill 时按检查点逐步推进

- [ ] **Step 1: 追加第四节正文**

```markdown

## 四、执行约束

上下文注入解决了"模型知道要做什么"的问题，但知道不等于做到——模型仍然可能跳步、走捷径、或者在流程还没完成时就声称"搞定了"。

Skill 系统用两种机制来解决这个问题。

### HARD-GATE：强语义禁止

你在很多 skill 里会看到这样的标记：

```
<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project,
or take any implementation action until you have presented a design
and the user has approved it.
</HARD-GATE>
```

很多人以为这是某种平台层的拦截机制——触发了就会被系统强制阻止。实际上不是。`HARD-GATE` 只是一个 XML 标签约定，它的"硬"来自措辞本身：`Do NOT`、`NEVER`、`This applies to EVERY project regardless of perceived simplicity`。

这些强语义词汇在训练数据中高度关联着"必须遵守"的语境，因此模型对它们的遵从度极高。这是提示工程的力量，不是代码执行的力量。它有效，但它的本质是语言约束，不是程序约束。

### Checklist → TodoWrite：外化状态机

第二个约束机制更为精妙。Skill 中的检查清单不只是列出来让模型"心里有数"——它强制要求模型通过 `TodoWrite` 工具将每个步骤的完成状态**写入 UI 可见的 todo 列表**。

这个设计的关键在于"外化"：

| 内部意图（无 skill） | 外化状态机（有 skill） |
|---------------------|----------------------|
| 模型内部推断"我已完成步骤 X" | 步骤 X 的完成状态写入工具调用，用户可见 |
| 模型可以在对话中声称完成了没完成的事 | 必须显式标记每个步骤为 completed |
| 跳步不留痕迹 | 跳步意味着 todo 状态不一致，行为被暴露 |

一个没有 skill 约束的 AI，在面对"实现新功能"时，会根据对话上下文推断最优路径——这通常意味着直接写代码，跳过设计、跳过评审、跳过测试。有了 skill，每个检查点都是显式的状态节点，模型必须一一经过，无法在内部"假装"完成了某步骤。
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write section 4 - execution constraints"
```

---

### Task 7: 撰写第五节——Skill 组合（~400字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 清晰区分纵向优先级（用户 > skill > 默认）和横向执行顺序（process skill 先于 implementation skill）
- 用 brainstorming → writing-plans 的完整流程作为具体示例：9 步检查清单、spec 写作、subagent 审查循环、用户审批门控，最终才能调用 writing-plans
- 总结 skill 体系作为"最佳实践的编译器"

- [ ] **Step 1: 追加第五节正文**

```markdown

## 五、Skill 组合

单个 skill 改变的是一次交互的行为。多个 skill 组合起来，才能覆盖完整的开发工作流。

### 横向执行顺序

当多个 skill 都适用于当前任务时，`using-superpowers` 元 skill 规定了调用顺序：**process skill 先于 implementation skill**。

- **Process skill**：定义"如何做"的流程，如 `brainstorming`（如何规划功能）、`systematic-debugging`（如何调试问题）
- **Implementation skill**：定义"做什么"的执行，如 `writing-plans`（写实现计划）、`executing-plans`（执行计划）

这个顺序确保了：在落笔写代码之前，思考和设计工作必须先完成。

### brainstorming → writing-plans：一个完整示例

这篇文章的写作过程本身就是最好的示例。当我说"写一篇博客"时，`brainstorming` skill 被触发，它包含一个 9 步强制检查清单：

1. 探索项目上下文
2. （如需要）提供可视化工具
3. 逐一询问澄清问题
4. 提出 2-3 种方案
5. 分节展示设计并获得确认
6. 写设计文档并提交 git
7. **Spec 审查循环**：派遣 subagent 审查 → 修复问题 → 再次审查（最多 3 轮）
8. **用户审批门控**：要求用户确认 spec 再继续
9. 才能调用 `writing-plans`

注意第 7、8 步：在进入实现阶段之前，有一个完整的质量门控——自动化审查 + 人工审批。这不是"建议这么做"，而是 skill 中的强制流程。跳过任何一步，都意味着违反了 HARD-GATE 约束。

这就是 skill 组合的价值：**把一个复杂工作流的最佳实践，编译成 AI 必须遵循的执行约束**。
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write section 5 - skill composition"
```

---

### Task 8: 撰写结语（~200字）

**Files:**
- Modify: `content/posts/claude-code-skill-原理解析.md`

**写作要求：**
- 总结 skill 的本质：最佳实践的编译器
- 区分 skill 与 CLAUDE.md：动态加载的领域规则 vs 静态全局规则
- 预告下一篇文章

- [ ] **Step 1: 追加结语**

```markdown

## 结语

回到最开始的问题：为什么 AI 突然变得如此精确？

因为有人把精确的流程写进了 skill——把"应该先做什么、必须经过哪些检查点、什么情况下绝对不能跳跃"，转化成了模型在 system prompt 层会优先参考的语义约束。

Skill 不是魔法，是工程。它的每一层机制——三层上下文加载、description 语义匹配、HARD-GATE 强语义禁止、TodoWrite 外化状态机——都是可以理解、可以设计、可以定制的。

最后有一个区别值得记住：**Skill 和 CLAUDE.md 都能影响模型行为，但方式截然不同。** CLAUDE.md 是静态全局规则，始终在 context 中；skill 是动态加载的领域规则，只在相关任务触发时注入。前者适合定义项目级别的永久约定，后者适合封装特定工作流的最佳实践。

下一篇，我们来讲如何从零创建自己的 skill。
```

- [ ] **Step 2: 提交**

```bash
git add content/posts/claude-code-skill-原理解析.md
git commit -m "feat: write conclusion section"
```

---

### Task 9: 验证与合并

**Files:**
- 无新增，验证现有文件

- [ ] **Step 1: 在 worktree 中验证 Hugo 构建**

```bash
hugo --buildDrafts 2>&1 | tail -5
```

Expected: 构建成功，无 ERROR 输出

- [ ] **Step 2: 检查文章渲染**

```bash
hugo list all | grep claude-code-skill
```

Expected: 看到文章条目

- [ ] **Step 3: 回到主分支并合并**

```bash
cd /Users/kezheng.sun/code/blog
git merge feat/claude-code-skill-blog
```

- [ ] **Step 4: 清理 worktree**

```bash
git worktree remove .claude/worktrees/blog-claude-code-skill
git branch -d feat/claude-code-skill-blog
```

- [ ] **Step 5: 最终提交确认**

```bash
git log --oneline -10
```

Expected: 看到所有博客章节的提交记录
