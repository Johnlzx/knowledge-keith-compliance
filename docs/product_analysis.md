# CosX Product Analysis: RidgeField Capital Compliance Agent

> Author: CosX Chief Product Designer
> Date: April 2026
> Status: POC Strategy & Pain Point Analysis

---

## 一、Keith 合规团队的痛点拆解

### 1.1 核心矛盾：法规复杂度 vs. 团队规模

RidgeField Capital 的现实处境：

| 维度 | 现状 | 挑战 |
|------|------|------|
| 团队规模 | 合规官 1 人（兼职 2-4 天/月） | 一个人要覆盖所有合规职能 |
| 法规体量 | 4 套核心法规 + 10+ 份 MAS 通知/指南 | 数千页法规文本，持续修订 |
| 合规任务 | 49+ 项 CMP 任务（日/周/月/季/年） | 高频重复，容错率为零 |
| 资金预算 | 年运营开销 S$156K-353K | 无法雇大团队，必须靠效率 |

### 1.2 五个具体痛点

```
痛点 1: "翻法规" —— 高频低效的知识检索
├── 场景：PM 问 "factsheet 免责声明的最小字号是多少？"
├── 现状：翻 Code on CIS 几百页找相关条款，耗时 30-60 分钟
├── 风险：记错条文 → 材料不合规 → MAS 处罚
└── 频率：每周数次

痛点 2: "审材料" —— 人工逐项核查营销文件
├── 场景：审查一份基金 factsheet 是否合规
├── 现状：合规官逐页对照法规检查，耗时 2-4 小时/份
├── 风险：遗漏某项披露要求 → 分发不合规材料
└── 频率：每份基金材料发布前

痛点 3: "跟修订" —— 法规持续更新
├── 场景：Code on CIS 2025年11月刚修订
├── 现状：手动比对新旧版本，识别变化
├── 风险：沿用已废止的旧规定
└── 频率：法规修订时（不定期）

痛点 4: "写合规" —— 从零起草合规文本
├── 场景：为新基金起草合规披露语言
├── 现状：参考旧模板 + 查法规 + 法律顾问确认
├── 风险：措辞不精确，不满足 MAS 要求
└── 频率：每支新基金

痛点 5: "证合规" —— 审查过程无可追溯记录
├── 场景：MAS 现场检查要求出示合规审查证据
├── 现状：邮件/口头确认，缺乏结构化审计记录
├── 风险：无法证明已做过合规审查
└── 频率：MAS 检查时（牌照后 6-12 个月）
```

### 1.3 痛点优先级矩阵

```
            高影响
              │
    痛点2     │    痛点1
   审材料      │    翻法规
  (高价值      │   (高频次
   低频次)     │    快见效)
              │
 ─────────────┼──────────── 高频次
              │
    痛点3     │    痛点4
   跟修订      │    写合规
              │
              │    痛点5
              │    证合规
            低影响
```

**结论：** 痛点 1（翻法规）是 POC 的最佳切入点 —— 高频、可量化、最快出效果。痛点 2（审材料）是产品的真正价值高地 —— 直接替代人力工时。

---

## 二、四个法规知识支柱

Agent 必须"精通"的知识库，按重要性排序：

### 支柱结构

```
┌─────────────────────────────────────────────────┐
│              合规知识体系                          │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   强制性法规    │  │   强制性准则    │             │
│  │              │  │              │             │
│  │  SFA         │  │  Code on CIS │             │
│  │  证券与期货法   │  │  集合投资计划   │             │
│  │              │  │  准则          │             │
│  │  法律效力：最高 │  │  法律效力：高   │             │
│  │  违反=刑事责任  │  │  违反=MAS处罚  │             │
│  └──────────────┘  └──────────────┘             │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   监管指引     │  │   行业自律     │             │
│  │              │  │              │             │
│  │  MAS Pointers│  │  IMAS Code   │             │
│  │  on CIS      │  │  of Best     │             │
│  │              │  │  Practices   │             │
│  │  法律效力：中  │  │  法律效力：低   │             │
│  │  MAS期望遵守  │  │  行业标准参考   │             │
│  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────┘
```

| # | 法规 | 核心内容 | Agent 用途 | 预估页数 |
|---|------|---------|-----------|---------|
| 1 | **SFA (Offers of Investment)** | 谁可以向谁推销、披露要求、豁免条件 | 判断营销对象合规性、豁免适用性 | ~100 页相关章节 |
| 2 | **Code on CIS (2025.11 修订)** | 基金设立/运营/估值/分销/披露全流程 | 最核心的审查规则来源，细到字号和措辞 | ~300-500 页 |
| 3 | **IMAS Code of Best Practices** | 行业自律规范、职业道德 | 补充最佳实践建议 | ~50-80 页 |
| 4 | **MAS Pointers on CIS** | MAS 的实务指导和常见问题 | 解释模糊条款、提供监管意图 | ~30-50 页 |

**关键洞察：** Code on CIS 是绝对核心 —— 它包含了营销材料审查中 80%+ 的规则来源。POC 如果只做一份法规，应该优先做这份。

---

## 三、两个核心用例深度拆解

### 用例一：深度合规问答 Agent

**用户画像：** 合规官、投资经理、运营人员
**使用场景：** 日常工作中遇到合规技术问题时

#### 典型问题分类

| 类别 | 示例问题 | 答案特征 |
|------|---------|---------|
| 精确数值 | "免责声明的强制字体大小?" | 有明确条文，答案唯一 |
| 时限要求 | "基金业绩展示必须覆盖多少年?" | 有明确条文，可能有例外情况 |
| 适用性判断 | "我们的太阳能基金是否需要 ESG 披露?" | 需要理解法规 + 公司情况 |
| 流程规范 | "修改基金投资策略需要什么审批流程?" | 多条法规交叉引用 |
| 比较分析 | "向 AI 和 II 推销的披露要求有什么区别?" | 需要综合多个条款对比 |

#### 答案质量标准（关键差异化）

```
❌ 普通 ChatGPT 回答:
"根据新加坡法规，基金营销材料通常需要包含风险提示。
建议咨询法律顾问获取具体要求。"
→ 模糊、无条文引用、无法用于合规决策

✅ CosX Compliance Agent 回答:
"根据 Code on CIS Appendix 1, Section 2.4:
- 风险免责声明最小字号为 10pt
- 必须与正文字号相同或更大
- 必须置于首页显著位置

相关条文: Code on CIS (Nov 2025), Appendix 1, §2.4(a)(iii)
另见: MAS Pointers on CIS, FAQ 12 关于字体大小的补充说明"
→ 精确、有条文来源、可直接用于合规决策
```

**核心技术要求：**
- 精确的法规条文检索（不是语义模糊匹配）
- 每个回答必须附带条文引用（Section/Paragraph 级别）
- 能处理法规间的交叉引用
- 能识别"此条文已被修订"的情况

### 用例二：营销材料自动审查 Agent

**用户画像：** 合规官（审查者）、投资团队（提交者）
**使用场景：** 基金 factsheet / pitch deck 发布前的合规审查

#### 审查规则举例（从法规中提取）

| 审查维度 | 具体规则 | 来源 |
|---------|---------|------|
| 业绩展示 | 必须展示最近 1/3/5/10 年或自成立以来的业绩 | Code on CIS |
| 业绩展示 | 必须使用经审计或基金管理员计算的 NAV | Code on CIS |
| 业绩展示 | 必须注明"过往业绩不代表未来表现" | Code on CIS |
| 费用披露 | 必须披露管理费、绩效费、申购/赎回费 | Code on CIS |
| 风险提示 | 必须列出投资本金可能损失的风险 | SFA / Code on CIS |
| 免责声明 | 最小字号要求 | Code on CIS Appendix |
| 分销限制 | 必须注明仅面向合格/机构投资者 | SFA s305 |
| 监管声明 | 必须注明 MAS 不对基金内容背书 | Code on CIS |

#### 审查输出格式

```
═══════════════════════════════════════════
  COMPLIANCE REVIEW REPORT
  Document: RidgeField Solar Fund Factsheet v2.1
  Reviewed: 2026-04-15
  Agent: CosX Compliance Agent v1.0
═══════════════════════════════════════════

  CRITICAL ISSUES (Must Fix) ────────────── 2 items

  [C-01] Page 1: Missing mandatory disclaimer
  Rule: Code on CIS, Appendix 1, §2.1(a)
  Required: "Past performance is not indicative
            of future performance"
  Found: Not present in document
  Action: Add disclaimer to page 1, above the fold

  [C-02] Page 3: Performance data coverage insufficient
  Rule: Code on CIS, §10.3(b)
  Required: Performance for 1, 3, 5, 10 years
            or since inception
  Found: Only 1-year and 3-year shown
  Action: Add 5-year data or "since inception" if
          fund is less than 5 years old

  WARNINGS (Review Recommended) ─────────── 3 items

  [W-01] Page 2: Fee disclosure may be incomplete
  Rule: Code on CIS, §8.2
  ...

  PASSED ──────────────────────────────── 15 items
  [P-01] Distribution restriction statement ... ✓
  [P-02] MAS non-endorsement clause ........... ✓
  ...

═══════════════════════════════════════════
```

**对 Keith 的价值量化：**

| 指标 | 现状（人工） | Agent 辅助 | 效率提升 |
|------|-----------|-----------|---------|
| 单份 factsheet 审查时间 | 2-4 小时 | 初筛 5 分钟 + 人工复核 30 分钟 | **80-90%** |
| 每月审查材料数 | 2-3 份（受限于人力） | 10+ 份 | **3-5x** |
| 遗漏风险 | 依赖个人经验 | 系统化检查所有规则 | **显著降低** |
| 审计证据 | 邮件/口头 | 结构化报告自动存档 | **完整可追溯** |

---

## 四、最优 POC 策略

### 4.1 POC 定位

```
POC 不是"产品展示"，而是"能力证明"。

目标：让 Keith 在 4 月见面时产生一个反应：
"这个东西比我自己翻法规更快、更准。"

不需要：完整产品 UI、用户管理、付费系统
只需要：对几个典型问题的精确回答 + 法规引用
```

### 4.2 POC Demo 脚本设计（4 月见面用）

#### Scene 1: "翻法规" 场景（2 分钟）

```
Keith 提问: "What is the minimum font size for risk
disclaimers in a CIS factsheet?"

Agent 回答: [精确条文 + Section 引用]

Keith 反应预期: "对，就是这个条文。"
→ 建立信任：Agent 知道法规细节
```

#### Scene 2: "交叉引用" 场景（2 分钟）

```
Keith 提问: "We want to distribute our solar energy fund
to accredited investors only. What are the disclosure
requirements and exemptions?"

Agent 回答: [SFA s305 豁免条件 + Code on CIS 披露要求
+ 交叉引用 MAS Pointers 的相关 FAQ]

Keith 反应预期: "它能把不同法规的相关条款整合在一起。"
→ 展示能力：跨法规综合分析
```

#### Scene 3: "审材料" 场景（3 分钟）

```
现场演示: 上传一份故意留有合规缺陷的 factsheet

Agent 输出: 结构化审查报告，标记 2-3 个 Critical Issues

Keith 反应预期: "这能帮我的团队省几个小时。"
→ 锚定价值：直接的工时节省
```

### 4.3 POC 技术架构（最小可行）

```
输入层
├── 合规问题（文本输入）
└── 营销材料（PDF 上传）—— Phase 2 可选
    │
    ▼
知识检索层 (RAG)
├── 向量数据库（法规文档分块索引）
│   ├── Code on CIS (优先级最高，最大文档)
│   ├── SFA Offers of Investment 相关章节
│   ├── MAS Pointers on CIS
│   └── IMAS Code of Best Practices
├── 分块策略：按 Section/Paragraph 切分
│   保留层级结构（Chapter > Section > Paragraph）
└── 元数据标注：法规名称、章节号、修订日期
    │
    ▼
推理层 (Claude)
├── 合规问答：检索 + 生成 + 条文引用
└── 材料审查：规则匹配 + 问题标记 + 报告生成
    │
    ▼
输出层
├── 合规回答（带条文引用）
└── 审查报告（结构化 Critical/Warning/Pass）
```

### 4.4 POC 成功标准

| 指标 | 标准 | 验证方法 |
|------|------|---------|
| 条文准确率 | >95% 的回答引用正确条文 | Keith 人工核对 10 个问题 |
| 回答相关性 | >90% 的回答直接回应问题 | Keith 主观评价 |
| 响应时间 | <15 秒出答案 | 计时 |
| 条文定位精度 | 精确到 Section/Paragraph 级别 | 检查引用格式 |

---

## 五、CosX 战略意义

### 5.1 与 XENI 的结构同构性

```
XENI (移民法)                    Keith Agent (基金合规)
─────────────────               ─────────────────────
UKVI 表格 + 支持文件要求          MAS 法规 + 合规审查规则
    ↓                               ↓
Agent 可执行的工作流              Agent 可检查的审查标准
    ↓                               ↓
签证申请材料审查                  基金营销材料审查
    ↓                               ↓
结构化审查结果                    结构化合规报告
```

**底层逻辑完全一致：** 把结构化的监管规则应用到实际业务文档的审查中。

### 5.2 Seed Deck 叙事支撑

| Tier | 领域 | 状态 | 证明点 |
|------|------|------|--------|
| Tier 1 | Immigration (XENI) | 已验证 | UKVI 签证申请 |
| **Tier 2** | **Fund Management Compliance** | **POC 进行中** | **RidgeField Capital** |
| Tier 3 | All Regulated Services | 路线图 | 跨司法管辖区复制 |

Keith 自己说的 "如果在新加坡做成了，可以扩展到其他司法管辖区" —— 这是客户主动验证了 CosX 的 TAM 扩展逻辑。

### 5.3 跨司法管辖区扩展路径

```
新加坡 MAS          香港 SFC           英国 FCA          澳洲 ASIC
Code on CIS    →   SFC Code      →   FCA COBS     →   ASIC RG
SFA            →   SFO           →   FSMA         →   Corps Act
MAS Pointers   →   SFC FAQ       →   FCA Guidance →   ASIC FAQ
IMAS Code      →   HKIMA Code    →   IA Code      →   FSC Code
     │                │                │                │
     └────────────────┴────────────────┴────────────────┘
                    同一个审查框架
                    只需替换知识库
```

---

## 六、4 月前行动清单

### 立即执行（本周）

- [ ] **获取 Code on CIS (2025.11 修订版)** —— POC 的核心知识库，几百页
- [ ] **获取 SFA Part XIII (Offers of Investment)** —— 已有部分在 `data/raw_regulations/`
- [ ] **获取 MAS Pointers on CIS** —— 实务指导
- [ ] **获取 IMAS Code of Best Practices** —— 行业标准

### 第一周

- [ ] 文档解析和分块索引（优先 Code on CIS）
- [ ] 搭建 RAG pipeline（向量数据库 + Claude）
- [ ] 测试 5 个典型合规问题的回答质量

### 第二周

- [ ] 优化检索精度（调整分块策略和元数据）
- [ ] 准备 demo 脚本（3 个场景）
- [ ] 准备一份"故意有缺陷"的 factsheet 用于审查演示

### Demo 日

- [ ] 现场演示合规问答（2-3 个问题）
- [ ] 现场演示材料审查（如时间允许）
- [ ] 收集 Keith 反馈，确认 Phase 2 pilot 方向
