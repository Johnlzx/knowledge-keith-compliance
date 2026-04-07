# Keith 合规团队需求洞察与 RAG 知识库评估

> CosX Product Team | April 2026
> 基于 Keith Wong / RidgeField Capital 合规业务分析

---

## 一、Keith 是谁，他在做什么

Keith Wong 是 RidgeField Capital 的合规顾问，为这家新加坡新设 LFMC（持牌基金管理公司）搭建合规体系。他的角色是"从零到一"的合规架构师——不仅要设计制度（TOM），还要在日常运营中确保公司满足 MAS 的全部合规要求。

**Keith 的核心困境：**

一个兼职合规官（2-4天/月），要管控 49 项定期合规任务、对照 4 套核心法规（数千页）审查每一份对外材料，同时随时准备应对 MAS 的现场检查。这是一个人力严重不足、但容错率为零的岗位。

---

## 二、痛点深度拆解

### 痛点 1：高频法规检索 —— "翻法规"

**场景还原：**
投资经理下午 3 点发来 Slack："Keith，我们新 factsheet 里业绩展示需要覆盖几年？5 年还是 10 年？下午 5 点前要发给客户。"

**现状：**
- Keith 打开 Code on CIS（500+ 页 PDF），Ctrl+F 搜索 "performance"
- 找到 3-4 个相关段落，需要理解哪个适用于当前情况
- 还要交叉查 MAS Pointers 看有没有补充解释
- 最终拼出一个完整回答，耗时 30-60 分钟

**痛在哪里：**
- 不是不知道答案，而是**定位条文太慢**
- 法规用法律语言写成，一个问题的答案可能散布在 3 个不同章节
- 回答必须**精确到条款号**——"大概是这样"在合规领域是不被接受的
- 同一问题可能被问过 10 次，但每次都要重新翻一遍确认

**频率：** 每周 3-5 次
**单次耗时：** 30-60 分钟
**年化隐性成本：** ~150-250 小时/年

---

### 痛点 2：营销材料合规审查 —— "审材料"

**场景还原：**
投资团队准备发一份 8 页的基金 factsheet 给潜在合格投资者。按 MAS 规定，这份材料在分发前必须经过合规审查。

**现状：**
- Keith 逐页阅读，对照 Code on CIS 的 20+ 条强制要求逐项检查
- 业绩展示是否合规？（覆盖年限、数据来源、免责声明）
- 费用披露是否完整？（管理费、绩效费、申购赎回费）
- 风险提示措辞是否符合要求？（指定措辞、字体大小、位置）
- 分销限制声明是否正确？（仅限 AI/II、MAS 不背书声明）
- 发现问题后标注，写邮件给投资团队要求修改
- 修改后再审一遍

**痛在哪里：**
- 检查项多（20+ 条规则）且**全靠人记忆哪些条目要查**
- 法规修订后（如 2025.11 Code on CIS 修订），旧的检查习惯可能遗漏新要求
- 一份材料改 2-3 轮很常见，每轮都要重新审
- **没有结构化的审查记录** —— MAS 来检查时，如何证明你审过？

**频率：** 每月 2-3 份材料
**单次耗时：** 2-4 小时（含修改往返）
**年化隐性成本：** ~100-150 小时/年

---

### 痛点 3：法规修订追踪 —— "跟修订"

**场景还原：**
MAS 在 2025 年 11 月发布了 Code on CIS 修订版。Keith 需要知道什么改了、对公司有什么影响、现有的政策和流程需要怎么更新。

**现状：**
- 下载新版，与旧版逐章对比
- 500 页文档，修订可能散布在数十个段落中
- MAS 有时提供修订摘要，但不一定覆盖所有细节
- 识别出变化后，还要更新公司的合规手册、CMP 任务、培训材料

**痛在哪里：**
- 纯人工比对，极其耗时且容易遗漏
- 修订的影响评估需要对公司业务有深度理解
- 如果漏了一条新要求，后果可能在 MAS 检查时才暴露

**频率：** 不定期（每年数次重大修订）
**单次耗时：** 1-2 天
**风险等级：** 高

---

### 痛点 4：合规文本起草 —— "写合规"

**场景还原：**
公司要发行一支新的太阳能基础设施基金。Keith 需要为基金文件起草合规披露语言——风险提示、免责声明、分销限制声明等。

**现状：**
- 参考旧基金的模板
- 查法规确认措辞要求（有些是 MAS 指定的原文措辞）
- 根据新基金的特殊性调整（如 ESG 相关披露）
- 交法律顾问审阅

**痛在哪里：**
- 每支新基金都有不同的特征，不能简单复制粘贴
- 法规对某些措辞有精确要求（如"过往业绩不代表未来表现"必须使用指定措辞）
- 起草者需要同时理解法规要求和基金产品细节

**频率：** 每支新基金（初期可能每年 1-2 支）
**单次耗时：** 数天
**风险等级：** 中

---

### 痛点 5：合规审计追溯 —— "证合规"

**场景还原：**
MAS 在牌照批准后 6-12 个月内会进行现场检查。检查官问："你们的基金 factsheet 在分发前经过了合规审查吗？请出示审查记录。"

**现状：**
- Keith 翻邮件找当时的审查往来
- 可能只有"已审核，可以发"的一行回复
- 没有结构化的审查报告说明具体检查了哪些项目
- 无法证明审查是系统化的而不是随意的

**痛在哪里：**
- MAS 检查要求的是**可追溯的合规证据**，不是口头保证
- 缺乏结构化记录不等于没做合规审查，但在检查官眼中效果等同于没做
- 重建审查记录（事后补）既耗时又有合规风险

**频率：** MAS 检查时（可能每 1-2 年一次）
**影响等级：** 极高（直接影响 MAS 对公司合规能力的评判）

---

## 三、深度洞察

### 洞察 1：Keith 需要的不是"通用 AI"，而是"法规专家系统"

普通 ChatGPT 对合规问题的回答是：
> "根据新加坡法规，基金营销材料通常需要包含风险提示。建议咨询法律顾问获取具体要求。"

这种回答对 Keith **完全没用**。他需要的是：
> "根据 Code on CIS (Nov 2025), Appendix 1, Section 2.4(a)(iii)，风险免责声明最小字号为 10pt Times New Roman 或等效字体。另见 FAQs on Fair and Balanced Advertising, Q7 关于字体标准的补充说明。"

**关键差异：精确条文引用、可验证、可直接用于合规决策。**

### 洞察 2：审材料不是"找错"，而是"结构化规则匹配"

营销材料合规审查的本质是：把法规中的 "必须 (must)" 和 "不得 (must not)" 条款，逐一对照文档内容做匹配检查。这是一个规则引擎问题，不是一个自然语言理解问题。

具体来说，审查规则可以分为：

| 规则类型 | 示例 | 检查方式 |
|---------|------|---------|
| **存在性检查** | "必须包含 MAS 不背书声明" | 检查文档是否包含指定文本 |
| **数值检查** | "免责声明字号不小于 10pt" | 提取字体信息并对比阈值 |
| **覆盖度检查** | "业绩数据必须覆盖 1/3/5/10 年" | 检查业绩表格的时间范围 |
| **措辞检查** | "风险提示必须使用指定措辞" | 对比文档文本与法规规定的原文 |
| **一致性检查** | "费率必须与基金文件一致" | 交叉对比 factsheet 与 OM |
| **禁止性检查** | "不得使用'保证收益'等措辞" | 扫描文档中的禁止用语 |

**产品启示：** Phase 2 的材料审查 Agent 应该把这些规则显式建模，而不是让 LLM 自由发挥。LLM 的角色是理解文档内容并执行规则匹配，不是自己判断什么合规什么不合规。

### 洞察 3：审查报告本身就是合规证据

Agent 生成的结构化审查报告（每项检查列明规则来源、检查结果、审查时间戳）直接解决了痛点 5。这不是附加功能，而是产品的内在属性——只要 Agent 做了审查，合规证据就自动产生了。

**对 Keith 的额外价值：** MAS 检查时，直接出示 Agent 审查报告 + 人工复核签字 = 完整的合规审查证据链。

### 洞察 4：Keith 看到了跨司法管辖区复制的可能

Keith 原话："如果在新加坡做成了，可以扩展到其他司法管辖区。"

这验证了一个关键假设：合规从业者自己知道不同市场的法规结构是同构的。香港 SFC 有自己的 Code on Unit Trusts，英国 FCA 有 COBS，澳洲 ASIC 有 RG 规则——框架相同，内容不同。

**产品启示：** 架构设计时就应该把法规知识库作为可替换模块，Agent 逻辑层与法规内容层解耦。

### 洞察 5：4 月 demo 的说服力公式

```
说服力 = 精确度 × 速度 × 可引用性

精确度：回答必须正确（错了反而减分）
速度：15 秒出答案 vs. 30 分钟翻法规（体感差异巨大）
可引用性：附带条文号，Keith 当场可以翻法规验证
```

Demo 不需要覆盖全部法规，只需要在 Code on CIS 这一份文档上做到 95%+ 准确。一份法规做透，比四份法规都做浅要有说服力得多。

---

## 四、四大法规知识支柱 —— RAG 素材盘点

### 素材可用性总览

| # | 法规文件 | 状态 | 文件路径 | 大小 | 备注 |
|---|---------|------|---------|------|------|
| 1 | **Code on CIS (2025.11 修订)** | ✅ 已有 | `Code_on_CIS_Nov2025.pdf` | 2.2 MB | **POC 核心素材**，基金运营/营销/披露的详细规则 |
| 2 | **SFA 2001 全文** | ✅ 已有 | `SFA_2001_Full.pdf` | 3.2 MB | 完整法案，Part XIII = Offers of Investment |
| 3 | **IMAS Code of Best Practices** | ✅ 已获取 | `IMAS_Code_Best_Practices_Advertising_CIS_ILP.pdf` | 57 KB / 9 页 | CIS/ILP 广告最佳实践（Sep 2006），MAS 要求 Authorised/Recognised funds 广告须遵守此准则 |
| 4 | **MAS Pointers on CIS** | ✅ 多文件覆盖 | 见下方补充素材 | — | 无单一文件，但 FAQ + Practitioners Guide + 各指南已全面覆盖 |

### 补充素材（23 份文件，14 MB）

**核心法规与通知：**

| 文件 | 大小 | 内容 | POC 价值 |
|------|------|------|---------|
| `SFA_CIS_Regulations_S602.pdf` | 790 KB | CIS 发行实施细则、招股书、广告标准 | 高 |
| `MAS_Notice_SFA04_N02_AML_CFT.pdf` | 299 KB / 38 页 | **反洗钱/反恐融资通知**（2025.6.30 修订），CDD/EDD/STR 强制要求 | 高 |
| `MAS_Guidelines_SFA04_N02_AML_CFT.pdf` | 660 KB / 63 页 | **AML/CFT 实施指南**，配合 N02 通知的详细操作指导 | 高 |
| `MAS_Notice_FSM_N21_Technology_Risk.pdf` | 71 KB | 技术风险管理通知（2024.5 生效） | 中 |

**MAS 指南（Guidelines）：**

| 文件 | 大小 | 内容 | POC 价值 |
|------|------|------|---------|
| `MAS_Guidelines_FMC_SFA04G05.pdf` | 426 KB | 基金管理公司牌照和行为指南 | 高 |
| `MAS_TRM_Guidelines.pdf` | 578 KB / 57 页 | 技术风险管理指南（2021.1） | 中 |
| `MAS_BCM_Guidelines_Jun2022.pdf` | 335 KB / 24 页 | 业务连续性管理指南 | 中 |
| `MAS_Environmental_Risk_Asset_Managers.pdf` | 1.0 MB | 资产管理者环境风险管理指南（2020.12） | 中（与太阳能基金相关） |
| `MAS_Individual_Accountability_Conduct.pdf` | 325 KB / 23 页 | 个人问责与行为操守指南 | 中 |
| `MAS_Fair_Dealing_Guidelines_May2024.pdf` | 598 KB / 40 页 | 公平交易指南（2024.5 修订），5 大公平交易成果 | 高 |
| `MAS_Guidelines_Outsourcing_FI.pdf` | 466 KB / 34 页 | 外包管理指南（2025.1 修订） | 中 |
| `MAS_Liquidity_Risk_FMC_SFA04G08.pdf` | 218 KB | 流动性风险管理指南 | 中 |

**FAQ 与实务指导：**

| 文件 | 大小 | 内容 | POC 价值 |
|------|------|------|---------|
| `FAQs on Fair and Balanced Advertising...pdf` | 417 KB | **广告合规 FAQ，含字号（10pt TNR）等具体规则** | **极高** |
| `Guidelines on Standards of Conduct for Digital Advertising A.pdf` | 456 KB | 数字广告合规指南（2025.9 新生效） | 高 |
| `MAS_FAQs_Offers_Shares_Debentures_CIS.pdf` | 343 KB | CIS 发行 FAQ | 中 |
| `MAS_FAQ_Individual_Accountability_Conduct.pdf` | 332 KB / 20 页 | IAC 指南 FAQ | 低 |
| `MAS_FAQ_Technology_Risk_Management.pdf` | 158 KB / 5 页 | 技术风险管理 FAQ | 低 |
| `MAS_CIS_Practitioners_Guide.pdf` | 97 KB | CIS 从业者指南 | 中 |
| `MAS_Incident_Reporting_Circular_2025.pdf` | 178 KB / 5 页 | 金融机构事件报告通告（2025） | 低 |

**IMAS 行业标准：**

| 文件 | 大小 | 内容 | POC 价值 |
|------|------|------|---------|
| `IMAS_Code_Best_Practices_Advertising_CIS_ILP.pdf` | 57 KB / 9 页 | CIS/ILP 广告最佳实践准则 | 高 |
| `IMAS_Code_of_Ethics_2010.pdf` | 527 KB / 41 页 | IMAS 职业道德与专业行为准则 | 中 |

### 知识库容量评估

```
素材总量:       23 份 PDF，14 MB，预估 2,500+ 页
四大核心支柱:    全部 ✅ 已就位
POC 核心素材:    Code on CIS + SFA + 广告 FAQ + IMAS Best Practices ✅
AML/CFT 素材:    Notice + Guidelines 完整配套 ✅
治理类素材:      Fair Dealing + IAC + BCM + TRM + Outsourcing ✅
```

---

## 五、GAP 分析与行动建议

### 5.1 覆盖率评估

对照 TOM 文档中列出的所有法规引用，当前覆盖情况：

| TOM 引用的法规 | 状态 | 备注 |
|---------------|------|------|
| SFA 2001 (Parts IV, V, XIII) | ✅ 完整 | 全文已有 |
| Code on CIS (Nov 2025) | ✅ 完整 | 最新修订版 |
| SFA 04-N02 (AML/CFT) | ✅ 完整 | Notice + Guidelines 配套 |
| SFA 04-N13 (Capital Adequacy) | ❌ 缺失 | 资本充足率计算规则，需手动获取 |
| SFA 04-N16 (Best Execution) | ❌ 缺失 | 最佳执行义务 |
| SFA 04-N22 (Competency) | ❌ 缺失 | CMFAS 考试和 CPD 要求 |
| SFA 04-N23 (Fund Data) | ❌ 缺失 | 基金数据提交 |
| SFA 04-G05 (FMC Guidelines) | ✅ 完整 | |
| SFA 04-G08 (Liquidity Risk) | ✅ 完整 | |
| FSM-N21 (Technology Risk) | ✅ 完整 | Notice + FAQ + TRM Guidelines |
| MAS-BCM (Business Continuity) | ✅ 完整 | |
| MAS-TRM (Technology Risk Mgmt) | ✅ 完整 | |
| MAS-OS-FI (Outsourcing) | ✅ 完整 | 2025.1 修订版 |
| MAS-ERM-AM (Environmental Risk) | ✅ 完整 | |
| FSG-G01 (Fit & Proper) | ❌ 缺失 | 适格性标准 |
| FSG-G04 (Fair Dealing) | ✅ 完整 | 2024.5 修订版 |
| MAS-IAC (Individual Accountability) | ✅ 完整 | Guidelines + FAQ |
| IMAS Code of Best Practices | ✅ 已获取 | 广告 CIS/ILP 准则 |
| IMAS Code of Ethics | ✅ 已获取 | 2010 版（2022 修订） |
| MAS Compliance Toolkit | ❌ 缺失 | MAS 合规工具包，非公开下载 |

**当前覆盖率：约 75%（15/20 项已覆盖）**

### 5.2 剩余缺口

| 缺口 | 严重程度 | 对 POC 影响 | 建议 |
|------|---------|------------|------|
| SFA 04-N13 资本充足率 | 中 | 低（POC 聚焦营销审查，非资本计算） | Phase 2 补充 |
| SFA 04-N16 最佳执行 | 中 | 低（交易执行相关，非营销审查） | Phase 2 补充 |
| SFA 04-N22 资质要求 | 低 | 极低 | 需要时补充 |
| SFA 04-N23 基金数据 | 低 | 极低 | 需要时补充 |
| FSG-G01 适格性标准 | 低 | 极低 | 需要时补充 |
| MAS Compliance Toolkit | 中 | 低（流程参考，非法规条文） | 非公开文件，需 Keith 提供 |

**结论：所有缺口均不影响 POC Phase 1 的核心功能（合规问答 + 营销材料审查）。**

### 5.3 RAG 构建优先级

**第一优先（立即处理）：**
1. `Code_on_CIS_Nov2025.pdf` — POC 的 80% 知识来源
2. `FAQs on Fair and Balanced Advertising...pdf` — demo 会被问到的具体规则
3. `IMAS_Code_Best_Practices_Advertising_CIS_ILP.pdf` — 广告审查补充规则

**第二优先（本周内）：**
3. `SFA_2001_Full.pdf` — 提取 Part XIII (Offers of Investment) 相关章节，约 100 页
4. `SFA_CIS_Regulations_S602.pdf` — CIS 发行实施细则

**第三优先（Phase 2 前）：**
5. 其余 MAS Guidelines 和 FAQ 文件
6. IMAS Code of Best Practices（待网站恢复后获取）

### 5.4 分块策略建议

Code on CIS 是一份高度结构化的法规文件，建议按以下方式分块：

```
Level 1: Part（部分）
  └── Level 2: Chapter（章）
        └── Level 3: Section（节）
              └── Level 4: Paragraph（段）

每个 chunk 的元数据：
{
  "source": "Code on CIS (Nov 2025)",
  "part": "Part IV",
  "chapter": "Chapter 10",
  "section": "10.3",
  "paragraph": "(b)",
  "title": "Performance Data in Advertisements",
  "revision_date": "2025-11-28",
  "legal_force": "Mandatory"
}
```

这样 Agent 回答时可以精确引用到 "Code on CIS, §10.3(b)"，Keith 当场可验证。

---

## 六、Demo 场景预设（基于现有素材）

以下问题可以用已有的法规素材回答，适合 4 月 demo：

### 场景 1: 字体大小（广告 FAQ）
> **Q:** "What is the minimum font size for disclaimers in a CIS factsheet?"
>
> **预期来源:** FAQs on Fair and Balanced Advertising, Q7
> **预期答案:** 10pt Times New Roman 或等效字体

### 场景 2: 业绩展示（Code on CIS）
> **Q:** "How many years of performance data must be shown in a fund factsheet?"
>
> **预期来源:** Code on CIS, Part IV, Chapter 10
> **预期答案:** 1 年、3 年、5 年、10 年或自成立以来

### 场景 3: 分销限制（SFA Part XIII）
> **Q:** "Can we distribute our fund factsheet to non-accredited investors in Singapore?"
>
> **预期来源:** SFA s305, Code on CIS distribution requirements
> **预期答案:** 不可以。RidgeField 持有 A/I 类 LFMC 牌照，仅限向 AI/II 分发

### 场景 4: 交叉引用（多法规）
> **Q:** "What mandatory disclaimers must appear on page 1 of our factsheet?"
>
> **预期来源:** Code on CIS Appendix + 广告 FAQ + SFA
> **预期答案:** MAS 不背书声明 + 过往业绩免责 + 分销限制声明 + 投资风险提示

---

## 七、总结

| 维度 | 评估 |
|------|------|
| Keith 的痛点是否真实？ | **是。** 1 个兼职合规官 vs. 4 套法规 + 49 项任务 = 结构性人力不足 |
| POC 能解决核心痛点吗？ | **能。** Phase 1 解决"翻法规"（高频），Phase 2 解决"审材料"（高价值） |
| 素材是否足够？ | **Phase 1 足够。** Code on CIS + SFA + FAQ 已就位，仅缺 IMAS Code（非关键） |
| 技术可行性？ | **可行。** RAG + Claude 是成熟路径，关键在分块质量和检索精度 |
| 商业说服力？ | **强。** 审材料从 2-4 小时降到 35 分钟 = 80-90% 效率提升，且自带审计证据 |
