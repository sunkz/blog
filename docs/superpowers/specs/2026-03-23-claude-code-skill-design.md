# Claude Code Skill 博客文章设计文档

**日期**：2026-03-23
**状态**：已修订（修复审查意见）

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
- 文件结构：YAML frontmatter（仅含 `name` 和 `description` 两个字段，其中 `description` 即触发规则）+ Markdown body（指令内容）
- 三层上下文加载架构：
  - 元数据层（name + description）：始终在 context 中
  - SKILL.md body：触发时动态加载
  - 附属资源层（scripts/、references/、assets/）：按需加载
- skill 文件的实际存储位置（`~/.claude/plugins/` 或项目本地路径）和发现机制

### 二、触发机制（~400字）
- `description` 字段的语义匹配逻辑：模型在每次处理用户输入时，对比 description 与当前任务，决定是否调用 Skill 工具
- "1% 原则"的本质：这是写在 `using-superpowers` 这个元 skill 中的一条显式指令，通过提示工程偏置模型向过度触发而非遗漏触发——它是策略，不是平台内置逻辑
- 触发 vs 不触发的边界案例分析
- description 写法对触发准确性的影响

### 三、上下文注入与优先级（~400字）
- 触发后，skill 的 Markdown body 被加载进当前会话上下文
- 优先级体系（指令 vs skill 的纵向优先级）：用户指令 > skill > 模型默认行为
- 为什么 skill 能可靠地影响模型行为：通过 system prompt 层注入，语义权重高于对话历史
- 注意：此优先级与"skill 之间的执行顺序优先级"是两个不同维度，不要混淆

### 四、执行约束（~500字）
- `HARD-GATE` 的本质澄清：它是 skill body 中的一种 XML 标记约定，通过强语义指令实现约束效果——不是平台层的代码级执行控制，而是提示工程层面的意图表达。它之所以"硬"，是因为措辞方式（"DO NOT"、"NEVER"）使模型高度遵从，而不是有运行时拦截机制
- Checklist → TodoWrite 的强制序列化：将执行状态外化为 UI 可见的 todo 项，使模型无法在内部"跳过"步骤——外化状态机 vs 内部意图
- 对比：没有 skill 的 AI 行为（根据对话推断最优路径）vs 有 skill 约束的 AI 行为（按预设检查点逐步推进）

### 五、Skill 组合（~400字）
- 两种优先级概念的区分：
  - **纵向优先级**：用户指令 > skill > 默认行为（谁说了算）
  - **横向执行顺序**：process skill（brainstorming、debugging）先于 implementation skill（执行类）
- 以 brainstorming → writing-plans 为例：brainstorming skill 包含 9 步强制检查清单，经过 spec 写作 → subagent 审查循环 → 用户审批门控，才能调用 writing-plans。这是 skill 组合约束的最具体示范
- Skill 体系作为"最佳实践的编译器"

### 结语（~200字）
- Skill 的本质：把人类的最佳实践编译成 AI 可执行的提示约束
- 与 CLAUDE.md 的区别：skill 是动态加载的领域规则（按需注入），CLAUDE.md 是静态全局规则（始终在 context）
- 预告：下篇将介绍如何创建自己的 skill

## 技术要点清单

- [ ] 精确描述 frontmatter 的两个字段：`name` 和 `description`（description 就是触发规则，无独立触发规则字段）
- [ ] 说明三层上下文加载架构（元数据/body/资源）
- [ ] 说明 skill 文件的存储位置和发现机制
- [ ] 澄清 "1% 原则" 是 using-superpowers 这个元 skill 中的显式策略指令，不是平台内置逻辑
- [ ] 澄清 `HARD-GATE` 是提示工程约束，不是代码级运行时拦截
- [ ] 说明 `TodoWrite` 作为外化状态机的作用
- [ ] 区分两种优先级维度：纵向（指令 vs skill）和横向（process vs implementation 执行顺序）
- [ ] 用 brainstorming → writing-plans 的完整 9 步流程作为组合约束的具体示例

## 字数分配

| 节次 | 字数 |
|------|------|
| 引子 | 200 |
| 一、Skill 文件的本质 | 400 |
| 二、触发机制 | 400 |
| 三、上下文注入与优先级 | 400 |
| 四、执行约束 | 500 |
| 五、Skill 组合 | 400 |
| 结语 | 200 |
| **合计** | **2500** |

## 不包含的内容

- 如何创建 skill（留给下一篇文章）
- 具体 skill 的使用教程
- Claude Code 的其他功能介绍
