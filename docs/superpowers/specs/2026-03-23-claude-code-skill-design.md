# Claude Code Skill 博客文章设计文档

**日期**：2026-03-23
**状态**：已批准

---

## 目标

写一篇面向进阶开发者的中文博客，深入解析 Claude Code Skill 的运作原理。

## 读者

- 已有 Claude Code 使用经验
- 想理解 skill 系统的底层机制
- 不需要手把手教程，需要原理性分析

## 文章信息

- **标题**：Claude Code Skill 是怎么工作的？一次调用的完整解剖
- **字数**：~2500 字
- **语言**：中文
- **发布位置**：`content/posts/` Hugo 博客目录
- **文件名**：`claude-code-skill-原理解析.md`
- **风格**：技术深度，有叙事感，精炼不啰嗦

## 文章结构

### 引子（~200字）
描述一个 skill 被触发的瞬间——用户输入一句话，AI 突然按照严格的流程执行，制造悬念："为什么 AI 突然变得如此精确？"

### 一、Skill 文件的本质（~400字）
- 不是插件，不是代码——是结构化的 system prompt 片段
- 文件结构：YAML frontmatter（name/description/触发规则）+ Markdown body（指令内容）
- description 字段的语义匹配逻辑：模型用它来决定是否调用

### 二、触发机制（~400字）
- Skill 工具（`Skill tool`）的调用决策过程
- "1% 原则"：只要有可能相关就必须触发，防止遗漏
- 触发 vs 不触发的边界案例分析
- description 写法对触发准确性的影响

### 三、上下文注入（~400字）
- 触发后，skill 的 Markdown body 被加载进当前会话上下文
- 优先级体系：用户指令 > skill > 模型默认行为
- 为什么 skill 能可靠地覆盖默认行为（而非"软性建议"）

### 四、执行约束（~400字）
- Hard-gate 的本质：不是警告，是禁止继续的硬边界
- Checklist → TodoWrite 的强制序列化机制
- 为什么这比"请按顺序执行"更可靠：外化状态 vs 内部意图
- 对比：没有 skill 的 AI 行为 vs 有 skill 约束的 AI 行为

### 五、Skill 组合（~300字）
- 多个 skill 并存时的优先级规则（process > implementation）
- 组合调用的实际效果：brainstorming → writing-plans 的衔接
- Skill 体系作为"最佳实践的编译器"

### 结语（~200字）
- Skill 的本质：把人类的最佳实践编译成 AI 可执行的约束
- 与 CLAUDE.md 的区别：skill 是动态加载的领域规则，CLAUDE.md 是静态全局规则

## 技术要点清单

- [ ] 解释 frontmatter 的 `description` 字段的语义匹配原理
- [ ] 说明 `HARD-GATE` 标记的执行机制
- [ ] 解释 `TodoWrite` 作为外化状态机的作用
- [ ] 说明 skill 优先级体系（用户 > skill > 默认）
- [ ] 对比 process skill 与 implementation skill
- [ ] 提及 skill 文件的实际存储位置和加载机制

## 不包含的内容

- 如何创建 skill（留给后续文章）
- 具体 skill 的使用教程
- Claude Code 的其他功能介绍
