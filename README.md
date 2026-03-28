# Keith Compliance RAG — 新加坡基金管理合规知识库

## 项目背景

为 Keith 合规团队构建 RAG 知识库，支撑两个核心用例：
1. **深度合规问答 Agent** — 精准回答法规细节问题（Phase 1，4月 demo）
2. **营销材料自动审查 Agent** — 上传 factsheet/pitch deck，自动标记不合规内容（Phase 2）

## 知识库架构

```
核心法规层
├── SFA 2001 全法（含 Part XIII Offers of Investment）
├── Code on CIS（2025年11月修订版）
├── IMAS Code of Best Practices（待补：网站迁移至4月29日）
└── MAS CIS Practitioner's Guide

广告合规层
├── FAQs on Fair and Balanced Advertising — 传统广告操作规则
│   （字体≥10pt TNR、MAS 免审声明措辞、13 种材料分类）
└── Guidelines on Digital Advertising FSG-03 — 数字渠道合规新边界
    （2026年3月25日刚生效，覆盖社交媒体/finfluencer/视频广告）

运营指引层
├── Guidelines on Licensing & Conduct of Business for FMCs (SFA 04-G05)
│   （托管、估值、报告、利益冲突、信息披露）
├── FAQs on Offers of Shares, Debentures and CIS
│   （招募说明书注册、审查、披露标准）
└── Guidelines on Liquidity Risk Management for FMCs (SFA 04-G08)

实施细则层
└── SFA CIS Regulations S602
    （CIS 发行的具体实施细则）
```

## 文件清单

### 核心法规（四大支柱）

| 文件 | 大小 | 来源 | 说明 |
|------|------|------|------|
| `SFA_2001_Full.pdf` | 3.2MB | SSO | 证券与期货法全文，含 Part XIII Offers of Investment |
| `Code_on_CIS_Nov2025.pdf` | 2.2MB | MAS | 集合投资计划准则（2025.11.28 修订），基金运营核心法规 |
| `MAS_CIS_Practitioners_Guide.pdf` | 97KB | MAS | CIS 实务指导，面向发行人和专业顾问 |

### 广告合规

| 文件 | 大小 | 来源 | 说明 |
|------|------|------|------|
| `FAQs on Fair and Balanced Advertising...pdf` | 417KB | MAS | Reg 46 SF(LCB)R 的操作指引，含字体、免责声明、材料分类 |
| `Guidelines on Standards of Conduct for Digital Advertising...pdf` | 456KB | MAS | FSG-03，数字广告准则（2026.3.25 生效），覆盖社交媒体合规 |

### 运营指引

| 文件 | 大小 | 来源 | 说明 |
|------|------|------|------|
| `MAS_Guidelines_FMC_SFA04G05.pdf` | 426KB | MAS | LFMC 牌照和业务行为准则（2025.9.3 修订） |
| `MAS_FAQs_Offers_Shares_Debentures_CIS.pdf` | 343KB | MAS | 招募说明书注册、审查和披露标准 FAQ |
| `MAS_Liquidity_Risk_FMC_SFA04G08.pdf` | 218KB | MAS | 基金流动性风险管理准则（2024.8.1 修订） |

### 实施细则

| 文件 | 大小 | 来源 | 说明 |
|------|------|------|------|
| `SFA_CIS_Regulations_S602.pdf` | 790KB | SSO | SF(OI)(CIS)R 2005，CIS 发行具体实施细则 |

## 待补齐

| 文件 | 原因 | 预计时间 |
|------|------|----------|
| IMAS Code of Best Practices in Advertising CIS and ILP | 网站迁移中 | 4月29日后 |
| SF(LCB)R 全文 | SSO 动态页面无法自动导出 | 需手动导出 |

## 目录结构

```
Keith-Compliance-RAG/
├── README.md
├── 01-Raw-Regulations/    ← 原始法规 PDF（9 份）
├── 02-Processed/          ← 解析后的文本/chunk（待处理）
└── 03-Notes/              ← 研究笔记（待创建）
```

## 关键链接

**MAS 官网**
- [Code on CIS](https://www.mas.gov.sg/regulation/codes/code-on-collective-investment-schemes)
- [CIS Offers 概览](https://www.mas.gov.sg/regulation/capital-markets/offers-of-collective-investment-schemes)
- [CIS Practitioner's Guide](https://www.mas.gov.sg/regulation/explainers/cis-practitioners-guide)
- [FMC Guidelines SFA04-G05](https://www.mas.gov.sg/regulation/guidelines/guideline-sfa-04-g05-on-licensing-registration-and-conduct-of-business-for-fund-managers)
- [Liquidity Risk Guidelines SFA04-G08](https://www.mas.gov.sg/regulation/guidelines/guidelines-sfa-04-g08-liquidity-risk-management-practices-for-fund-managers)
- [FAQs on Offers](https://www.mas.gov.sg/regulation/faqs/faqs-on-offers-of-shares-debentures-and-cis)

**SSO 法规原文**
- [SFA 2001 全文](https://sso.agc.gov.sg/Act/SFA2001)
- [SFA CIS Regulations S602](https://sso.agc.gov.sg/SL/SFA2001-S602-2005)

**IMAS**
- [Industry Guidelines](https://imas.org.sg/industry-guidelines/)（迁移中，预计4月29日恢复）

---
*创建日期：2026-03-28*
