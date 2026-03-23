# 设计文档：Claude Code Worktree 博客文章

**日期：** 2026-03-23
**状态：** 已批准
**类型：** 博客文章

---

## 目标

为 [sunkz.top](https://sunkz.top) 博客撰写一篇中文技术文章，介绍 Claude Code 的 Worktree 功能。

## 读者定位

有 Claude Code 基础的开发者，了解 git 基本操作，但尚未使用过 worktree 功能。

## 写作策略

**方案 A：问题驱动式**

先用真实开发痛点引起共鸣，再自然引出 worktree 概念和用法。核心逻辑：

```
痛点引入 → 传统解法的局限 → Worktree 的本质 → 核心用法 → 典型场景 → 最佳实践
```

## 文章结构

### 标题
`Claude Code Worktree：告别上下文污染，拥抱并行开发`

### 第一节：开篇痛点
描述真实场景：feature 开发到一半，线上出现紧急 bug。切换分支会丢失 Claude 的任务上下文，不切换又会污染 feature 开发。强调在 Claude Code 中这个问题比传统开发更严重——AI 的工作上下文也会跟着被污染。

### 第二节：传统解法的局限
- `git stash`：保存代码但 Claude 的任务上下文丢失
- 另开终端切换分支：文件锁、构建缓存互相干扰
- 等待完成一件再做另一件：失去 AI 辅助开发的并行优势

核心问题：这些方法解决了代码层面的隔离，却忽略了 AI 任务上下文的隔离。

### 第三节：Worktree 的本质
- 解释 Git Worktree：一个 git 仓库同时 checkout 多个工作目录，共享 `.git` 历史（点到即止，不深入底层）
- 解释"上下文污染"的机制：Claude Code 通过读取工作目录中的文件（修改中的代码、todo 文件、CLAUDE.md 等）来建立任务上下文，脏目录下切换任务会让 AI 对新任务产生错误理解
- 在 Claude Code 中的升华：不同终端窗口中的 Claude 会话各自进入不同 worktree，每个会话专注自己的任务，互不干扰
- 澄清"并行"的真实含义：不是自动并发，而是支持你在多个终端窗口中各自独立工作，随时切换不丢失上下文
- 类比：**浏览器的多标签页**——每个标签页（worktree）有独立状态，可以快速切换，而不是"多线程"这种含并发执行含义的类比

### 第四节：核心用法
git worktree 基础命令（含代码示例，3 条命令）：
```bash
git worktree add .worktrees/feature-auth -b feature/auth
git worktree list
git worktree remove .worktrees/feature-auth
```
介绍 Claude Code 的 `EnterWorktree` / `ExitWorktree` 的增强：
- 自动管理目录（创建在 `.claude/worktrees/` 下）、切换会话 CWD、清理上下文缓存
- 退出时的两种模式：`keep`（保留 worktree 目录供后续继续）vs `remove`（任务完成后清理）
- 路径约定：Claude Code 创建的 worktree 默认在 `.claude/worktrees/<name>` 目录下

### 第五节：典型场景
三个场景，每个用文字描述 before/after + 关键命令示例（1-2 条）：

1. **紧急 hotfix 不打断 feature 开发**：新建 hotfix worktree → 修复合并 → 回到 feature 上下文完整
2. **并行实验两个技术方案**：各开一个 worktree → 在不同终端窗口各自让 Claude 实现 → 对比后合并优胜方案
3. **代码评审不影响当前工作**：新建 review worktree checkout 对方分支 → Claude 分析代码 → 完成后 remove

### 第六节：最佳实践 + 结尾
最佳实践列表（4-5 条，简洁要点）：
- 命名要有语义（`feature/auth`、`hotfix/login-crash`）
- 及时清理：任务完成后用 `remove` 而非 `keep`
- `.gitignore` 保持干净：将 `.claude/worktrees/` 和 `.worktrees/` 加入忽略
- 一个 worktree 对应一个明确任务，不要混用
- 每个 worktree 开一个独立终端，与其配套的 Claude 会话专注该任务

结尾：worktree 不是高级技巧，而是 AI 辅助开发时代的基础工作方式。

## 技术约束

- 格式：Hugo Markdown，YAML front matter
- 语言：中文
- 风格：简洁直接，与博客现有文章风格一致
- 存放路径：`content/posts/Claude Code Worktree：告别上下文污染，拥抱并行开发.md`

## 成功标准

- 读者读完后理解 worktree 解决了什么问题
- 读者能直接上手使用基本命令
- 文章流畅，不枯燥，有真实感
