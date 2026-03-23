# Claude Code Worktree 博客文章实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Hugo 博客 `content/posts/claude-code-worktree.md` 中撰写一篇中文技术文章，向有 Claude Code 基础的开发者介绍 Worktree 功能。

**Architecture:** 单文件 Markdown 博客文章，Hugo YAML front matter 格式。文章采用问题驱动结构，从痛点出发自然引出 worktree 概念和用法，六节递进。

**Tech Stack:** Hugo Markdown, YAML front matter, Git Worktree, Claude Code EnterWorktree/ExitWorktree

**Spec:** `docs/superpowers/specs/2026-03-23-claude-code-worktree-blog-design.md`

---

## 文件结构

| 操作 | 路径 | 说明 |
|------|------|------|
| 创建 | `content/posts/claude-code-worktree.md` | 博客文章主体 |

---

### Task 1：创建文章文件及 Front Matter

**Files:**
- Create: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 创建文件，写入 front matter**

```markdown
---
title: "Claude Code Worktree：告别上下文污染，拥抱并行开发"
date: 2026-03-23T00:00:00+08:00
tags: ["Claude Code", "Git", "Worktree", "AI 开发"]
---
```

- [ ] **Step 2: 验证 Hugo 能识别该文件**

```bash
hugo list all 2>/dev/null | grep worktree
```

预期输出：包含 `claude-code-worktree` 的一行

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): scaffold claude code worktree post"
```

---

### Task 2：写第一节——开篇痛点

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 在 front matter 后追加第一节内容**

内容要点：
- 描述真实场景：你正在让 Claude Code 开发一个新 feature，写到一半，线上突然出现紧急 bug。
- 展示两难：切换分支 → Claude 的任务上下文消失，要重新描述需求；不切换 → feature 分支被 bug 修复代码污染。
- 强调 Claude Code 场景的特殊性：不只是代码层面的混乱，AI 对任务的"理解"也会随工作目录的文件状态而改变。

示例段落草稿：

```markdown
## 一个你可能遇到过的场景

你正在让 Claude Code 帮你实现一个新功能，任务进行到一半——相关文件已经改动了七八处，todo 列表也做了一半。

这时，线上来了一个紧急 bug，需要立刻修复。

你面临两个选择：

**切换分支去修 bug**：代码是干净了，但 Claude 之前对这个 feature 任务的理解全没了。等你回来，还得重新描述一遍需求，AI 也得重新读一遍代码才能接着干。

**在当前分支就地修 bug**：上下文保住了，但 feature 分支里混进了 bug 修复的代码，提交历史一团糟，合并的时候你会后悔的。

这个问题在传统开发中就很烦，在 AI 辅助开发中更严重——因为 Claude Code 不只是执行命令，它是通过读取你工作目录里的文件（改动中的代码、CLAUDE.md、todo 列表）来建立对当前任务的理解。工作目录一乱，AI 的理解就跟着乱。
```

- [ ] **Step 2: 检查内容是否流畅、符合设计意图**

对照 spec 第一节要求：
- [x] 真实场景描述
- [x] 切换 vs 不切换的两难
- [x] 强调 Claude Code 中上下文污染机制

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 1 - opening pain point"
```

---

### Task 3：写第二节——传统解法的局限

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 追加第二节**

内容要点：
- `git stash`：代码是藏起来了，但 Claude 的任务上下文（它对当前 feature 的理解）已经消失，切回来还得重建。
- 另开终端切换分支：两个任务共享同一个工作目录的时候会有文件锁、构建缓存竞争等问题。
- 等待：失去 AI 辅助开发能同时推进多件事的优势。
- 点明核心问题：这些方法都只解决了代码层面的隔离，没有解决 AI 任务上下文的隔离。

示例段落草稿：

```markdown
## 传统解法，为什么不够用

**`git stash` 一下？**

代码是存起来了，但 Claude 对这个任务的理解却没存。等你 `git stash pop` 回来，它不知道你在做什么，得重新读代码、重新确认需求。

**另开一个终端，切到 hotfix 分支？**

两个终端操作同一个目录，`node_modules` 锁文件、构建缓存、编辑器的文件监听——总有一个会打架。更关键的是，Claude 的工作上下文是绑定在会话和当前目录上的，换了目录，它就换了"世界观"。

**等当前任务做完再处理？**

这是最省心的，但也放弃了 AI 辅助开发最大的优势：让多件事同时推进。

这些方法的共同问题：它们解决的是**代码层面的隔离**，却忽略了 **AI 任务上下文的隔离**。
```

- [ ] **Step 2: 检查内容**

对照 spec 第二节要求：
- [x] 三种传统解法的局限
- [x] 点明核心问题

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 2 - traditional solutions limitations"
```

---

### Task 4：写第三节——Worktree 的本质

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 追加第三节**

内容要点：
- 简短解释 Git Worktree（不深入底层）：一个仓库可以同时 checkout 多个工作目录，各自有独立的文件状态，共享同一份 `.git` 历史。
- 解释"上下文污染"的机制：Claude Code 通过读取工作目录中的文件来建立任务上下文；干净隔离的目录 = AI 专注当前任务。
- 澄清"并行"的真实含义：不是自动并发，而是你可以在不同终端窗口开启不同 Claude 会话，各自进入不同 worktree，互不干扰。
- 使用"浏览器多标签页"类比（不用"多线程"）。

示例段落草稿：

```markdown
## Worktree 是什么，为什么它能解决这个问题

Git 有一个不太常用的功能叫 **Worktree**：让同一个仓库同时 checkout 到多个目录，每个目录有独立的文件状态，但共享同一份 `.git` 提交历史。

换句话说，你可以在 `/my-project/.worktrees/feature-auth` 开发新功能，同时在 `/my-project/.worktrees/hotfix-login` 修复 bug，两个目录互不影响。

在 Claude Code 里，这件事变得更有价值。

Claude 建立任务上下文的方式，是读取当前工作目录里的文件——修改中的代码、CLAUDE.md、todo 列表。当你给 Claude 一个干净的、专属于这个任务的 worktree，它就能专注地工作，不会被其他任务的文件"分心"。

这里说的"并行"不是 AI 自动变成多线程。准确的说法是：你可以打开多个终端窗口，每个窗口运行一个 Claude Code 会话，各自进入不同的 worktree——一个专注 feature，一个处理 hotfix，互不干扰，随时切换。

类比一下：这就像浏览器的多标签页。每个标签页（worktree）有自己独立的状态，你可以随时切换，但它们之间不会互相污染。
```

- [ ] **Step 2: 检查内容**

对照 spec 第三节要求：
- [x] Git Worktree 解释（简短）
- [x] 上下文污染机制
- [x] 并行的真实含义（多终端）
- [x] 浏览器多标签页类比

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 3 - worktree concept"
```

---

### Task 5：写第四节——核心用法

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 追加第四节**

内容要点：
- 三条 git worktree 基础命令（代码块）。
- 介绍 Claude Code 的 EnterWorktree / ExitWorktree 工具（注意：这两个工具由 Claude Code 内部调用，不是命令行命令）。
- 说明 Claude Code 的增强：自动管理目录（`.claude/worktrees/<name>`）、切换会话 CWD、清理上下文缓存。
- 说明退出时的两种模式：`keep` vs `remove`。
- `.gitignore` 注意事项（**注意：这是写入文章的最佳实践内容，不是对当前仓库的操作**）。

示例段落草稿：

```markdown
## 怎么用

### Git 基础命令

```bash
# 创建新的 worktree（同时新建一个分支）
git worktree add .worktrees/feature-auth -b feature/auth

# 查看当前所有 worktree
git worktree list

# 任务完成后，删除 worktree
git worktree remove .worktrees/feature-auth
```

这三条命令就够用了。

### Claude Code 的增强

Claude Code 在 Git Worktree 的基础上提供了更深度的集成，通过内置的 `EnterWorktree` 和 `ExitWorktree` 工具（由 Claude Code 内部管理，不是命令行命令）来实现：

- **自动管理目录**：worktree 创建在 `.claude/worktrees/<name>` 下，统一管理
- **切换会话工作目录**：Claude 会话整个"搬进"新的 worktree，它读到的文件全是这个任务的
- **清理上下文缓存**：进入新 worktree 时，Claude 会清除之前任务的上下文残留

退出 worktree 时有两种模式：
- `keep`：保留目录，方便下次继续
- `remove`：任务完成，直接清理

### .gitignore

别忘了把 worktree 目录加入 `.gitignore`，防止意外提交：

```
.claude/
.worktrees/
```

注意：`.claude/` 会忽略整个 Claude Code 本地目录（包含 worktrees），范围比 `.claude/worktrees/` 更广，推荐使用前者。
```

- [ ] **Step 2: 检查内容**

对照 spec 第四节要求：
- [x] 三条 git 命令（含代码块）
- [x] EnterWorktree/ExitWorktree 说明（内部工具，非命令行）
- [x] keep/remove 两种模式
- [x] .gitignore 说明

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 4 - core usage"
```

---

### Task 6：写第五节——典型场景

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 追加第五节（三个场景）**

每个场景：文字描述 before/after + 1-2 条关键命令

**场景 1：紧急 hotfix 不打断 feature 开发**

```markdown
### 场景一：紧急 hotfix，不打断 feature 开发

**Before**：feature 写到一半，线上 bug 来了，只能 stash 或者两个任务挤在一个分支。

**After**：

```bash
# 在新 worktree 里处理 hotfix
git worktree add .worktrees/hotfix-login -b hotfix/login
```

在新终端进入 `.worktrees/hotfix-login`，开一个新的 Claude Code 会话，专门修复这个 bug。修完合并，删掉 worktree。

回到原来的终端，feature 的 Claude 会话还在，任务上下文完整，接着干。
```

**场景 2：并行实验两个技术方案**

```markdown
### 场景二：并行实验两个方案

不确定用方案 A 还是方案 B？

```bash
git worktree add .worktrees/approach-a -b experiment/approach-a
git worktree add .worktrees/approach-b -b experiment/approach-b
```

两个终端窗口，各自让 Claude 实现一个方案，最后对比结果，保留更好的那个，删掉另一个。
```

**场景 3：代码评审不影响当前工作**

```markdown
### 场景三：代码评审，不影响当前工作

同事的 PR 需要你 review？

```bash
git worktree add .worktrees/review-pr-123 origin/feature/some-feature
```

新开一个 worktree checkout 对方分支，让 Claude 分析代码、找潜在问题。评审完，`git worktree remove` 清理干净。主线工作全程不受影响。
```

- [ ] **Step 2: 检查内容**

对照 spec 第五节要求：
- [x] 三个场景 before/after
- [x] 每个场景含关键命令

- [ ] **Step 3: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 5 - typical scenarios"
```

---

### Task 7：写第六节——最佳实践 + 结尾

**Files:**
- Modify: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 追加第六节**

示例段落草稿：

```markdown
## 最佳实践

**命名要有语义**

手动 `git worktree add` 时，分支名用 `feature/auth`、`hotfix/login-crash` 这样的格式；使用 Claude Code EnterWorktree 时，name 参数描述任务即可（如 `auth`、`hotfix`），工具会自动加上 `worktree-` 前缀。

**及时清理**

任务完成后，优先选 `remove` 而不是 `keep`。Worktree 不是存档，完成即清理，保持工作区整洁。

**`.gitignore` 保持干净**

```
.claude/
.worktrees/
```

`.claude/` 会忽略所有 Claude Code 本地文件（包括 worktrees 目录）；`.worktrees/` 则忽略你手动创建的 worktree 目录。两者都要加。

**一个 worktree，一个任务**

不要在同一个 worktree 里混做两件事。一旦混用，你就失去了隔离的意义。

**一个终端，一个 Claude 会话**

每个 worktree 对应一个独立的终端窗口和 Claude Code 会话。它们是一一对应的关系。

---

Worktree 不是什么高级技巧，而是在 AI 辅助开发时代，保持任务清晰、上下文干净的基础工作方式。

当你的 AI 协作者需要专注，给它一个专属的工作空间。
```

- [ ] **Step 2: 检查内容**

对照 spec 第六节要求：
- [x] 4-5 条最佳实践
- [x] 结尾收束语句

- [ ] **Step 3: 通读全文，检查流畅度**

从头到尾通读一遍，确认：
- 各节之间过渡自然
- 用词统一（"worktree" 大小写一致，"Claude Code" 全称一致）
- 没有重复表达或逻辑跳跃

- [ ] **Step 4: Commit**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "feat(blog): write section 6 - best practices and closing"
```

---

### Task 8：验证 Hugo 构建

**Files:**
- Read: `content/posts/claude-code-worktree.md`

- [ ] **Step 1: 运行 Hugo 构建，确认没有报错**

```bash
hugo --minify 2>&1 | grep -E "error|warn|worktree"
```

预期：无 error，可能有 warn（图片未提供等，可忽略）

- [ ] **Step 2: 预览文章列表确认文章已发布**

```bash
hugo list all | grep worktree
```

预期：`claude-code-worktree` 出现在列表中

- [ ] **Step 3: 最终 commit（如有修改）**

```bash
git add content/posts/claude-code-worktree.md
git commit -m "fix(blog): fix any hugo build issues in worktree post"
```
