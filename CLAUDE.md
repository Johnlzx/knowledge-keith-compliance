# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Keith Compliance RAG is a knowledge base and (planned) RAG pipeline for Singapore MAS financial compliance, targeting licensed fund management companies (LFMCs). It is a git submodule within the parent `xeni-moderation-agent` Next.js application.

Two core use cases:
1. **Compliance Q&A Agent** (Phase 1, April 2026 demo) — precise regulatory answers with section-level citations
2. **Marketing Material Review Agent** (Phase 2, pilot) — auto-review fund factsheets against 20+ compliance rules, generating structured reports with Critical/Warning/Pass findings

The target client is RidgeField Capital (Singapore LFMC). Documentation is primarily in Chinese (Mandarin).

## Repository Structure

```
Keith-Compliance-RAG/
├── 01-Raw-Regulations/    # 10 source PDFs (~9MB, ~1600+ pages)
├── 02-Processed/          # (Future) parsed text chunks for vector DB
├── 03-Notes/              # Research notes
├── docs/
│   ├── product_analysis.md          # Pain points, POC strategy, demo script
│   ├── business_overview.md         # RidgeField Capital company context
│   ├── keith_requirements_and_insights.md  # Detailed needs analysis
│   └── diagrams/                    # PlantUML diagrams (architecture, roadmap, etc.)
```

## Regulatory Knowledge Architecture

Four pillars, by legal authority (highest to lowest):

| Pillar | Key Document | Legal Force |
|--------|-------------|-------------|
| **Statute** | SFA 2001 (Securities & Futures Act) | Highest — criminal liability |
| **MAS Code** | Code on CIS (Nov 2025 revision) | High — MAS enforcement |
| **MAS Guidelines** | FMC Guidelines (SFA 04-G05), Liquidity Risk (SFA 04-G08), CIS Practitioners Guide | Medium — expected compliance |
| **Industry Code** | IMAS Code of Best Practices | Low — best practice reference |

Additionally, advertising-specific regulations: FAQs on Fair and Balanced Advertising, and Guidelines on Digital Advertising (FSG-03, effective 2026-03-25).

**Code on CIS is the single most important document** — it contains 80%+ of marketing material review rules.

## Planned Technical Architecture

```
Input → RAG (vector DB with section/paragraph-level chunks) → Claude API → Structured output
```

- Chunking strategy: hierarchical by Part > Chapter > Section > Paragraph
- Metadata per chunk: regulation name, section number, revision date, legal force level
- Quality bar: >95% citation accuracy, <15s response time, section/paragraph-level precision
- Output: structured compliance reports (Critical/Warning/Pass) with exact regulatory citations

## Relationship to Parent Project

The parent `xeni-moderation-agent` repo contains a Next.js 16 app with a compliance demo page at `/compliance/demo` (`src/app/compliance/demo/page.tsx`). That page currently renders mock data from `src/lib/compliance-demo.ts`. The planned integration replaces mock data with real RAG-powered API calls.

## Key Documents for Context

- `docs/product_analysis.md` — POC strategy, 4 demo scenarios, pain point priority matrix
- `docs/keith_requirements_and_insights.md` — detailed RAG evaluation criteria and compliance workflow analysis
- `docs/business_overview.md` — RidgeField Capital operations, fund types, team structure
