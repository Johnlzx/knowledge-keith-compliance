// ── Mock conversation data for Document Review ────────────────────

import type { ComplianceMessage } from "./types";

export const reviewMockMessages: ComplianceMessage[] = [
  // ── User uploads factsheet ─────────────────────────────────────
  {
    id: "rv-m1",
    role: "user",
    blocks: [
      {
        type: "text",
        content:
          "Please review this fund factsheet for compliance with MAS advertising and disclosure requirements before we distribute it to retail investors.",
        attachment: {
          filename: "Asia_Focus_VCC_Q1_2026_Factsheet.pdf",
          filesize: "2.4 MB",
          filetype: "pdf",
          status: "uploaded",
        },
      },
    ],
  },

  // ── AI: Thinking + report progress ─────────────────────────────
  {
    id: "rv-m2",
    role: "ai",
    blocks: [
      {
        type: "text",
        content:
          "I'll conduct a comprehensive compliance review of the factsheet against the four regulatory frameworks — SFA, Code on CIS, IMAS Code of Best Practices, and the new MAS Digital Advertising Guidelines.",
      },
      {
        type: "thinking",
        thinking: {
          title: "Reviewing Asia Focus VCC Fund Factsheet",
          description:
            "Performing a systematic compliance scan of the uploaded factsheet against all applicable MAS regulatory requirements for CIS marketing materials directed at retail investors.",
          steps: [
            {
              icon: "analyze",
              text: "Scanning document structure and content — 12 pages, fund overview, performance, fees, risk disclosures",
            },
            {
              icon: "search",
              text: "Cross-referencing with Code on CIS (Nov 2025) mandatory disclosure checklist",
            },
            {
              icon: "visit",
              text: "Checking advertising compliance against SF(LCB)R Regulation 46 font and disclaimer requirements",
            },
            {
              icon: "analyze",
              text: "Verifying performance presentation against IMAS Code of Best Practices standards",
            },
            {
              icon: "search",
              text: "Reviewing fee disclosure completeness per Code on CIS Chapter 7 requirements",
            },
          ],
        },
      },
      {
        type: "report-progress",
        reportProgress: {
          title: "Generating Compliance Report",
          steps: [
            {
              label: "Parsing document — 12 pages, 4 sections",
              status: "done",
            },
            {
              label: "Extracting text and visual elements",
              status: "done",
            },
            {
              label: "Checking SFA & SF(LCB)R requirements",
              status: "done",
            },
            { label: "Checking Code on CIS (Nov 2025)", status: "done" },
            { label: "Checking IMAS Best Practices", status: "done" },
            {
              label: "Compiling findings",
              status: "done",
              detail: "3 critical, 2 warnings identified",
            },
            { label: "Generating final report", status: "done" },
          ],
          report: {
            filename: "Compliance_Review_Asia_Focus_VCC_Q1_2026.pdf",
            filesize: "340 KB",
            status: "ready",
          },
        },
      },
    ],
  },

  // ── AI: Full review results ────────────────────────────────────
  {
    id: "rv-m3",
    role: "ai",
    blocks: [
      {
        type: "heading",
        content:
          "Compliance Review Report — Asia Focus VCC Q1 2026 Factsheet",
        level: 2,
      },
      {
        type: "text",
        content:
          'I\'ve completed a full compliance review against all four regulatory frameworks. The factsheet has **3 critical issues** that must be resolved, **2 warnings** that should be addressed, and **8 items that pass** compliance checks.',
      },
      {
        type: "heading",
        content: "Compliance Findings",
        level: 3,
      },
      {
        type: "findings",
        findings: [
          {
            severity: "critical",
            issue:
              "Risk disclaimer font size is 8pt — below the 10pt minimum required",
            location: "Page 1, footer section",
            regulation: "Reg 46(7) SF(LCB)R",
            recommendation:
              "Increase all disclaimer and risk warning text to minimum 10pt Times New Roman or equivalent legible typeface",
          },
          {
            severity: "critical",
            issue:
              "Missing mandatory MAS review disclaimer on pages 2–12",
            location: "Pages 2–12",
            regulation: "Reg 46(8) SF(LCB)R",
            recommendation:
              'Add "This advertisement has not been reviewed by the Monetary Authority of Singapore." to every page of the factsheet',
          },
          {
            severity: "critical",
            issue:
              "Performance data shows only 6-month returns — minimum 1-year period required for retail distribution",
            location: "Page 4, Performance section",
            regulation: "Code on CIS, Appendix 1, Para 4.2",
            recommendation:
              "Include performance returns for 1-year, 3-year, 5-year, 10-year (or since inception) periods with appropriate annualization",
          },
          {
            severity: "warning",
            issue: "Performance chart lacks benchmark comparison",
            location: "Page 4, Performance chart",
            regulation: "IMAS Best Practices, Section 3.1",
            recommendation:
              "Add relevant benchmark index (e.g., MSCI Asia ex-Japan) as a comparison line on the performance chart",
          },
          {
            severity: "warning",
            issue: "Fee disclosure missing Total Expense Ratio (TER)",
            location: "Page 8, Fees & Charges section",
            regulation: "Code on CIS, Chapter 7.2",
            recommendation:
              "Include the audited Total Expense Ratio for the most recent financial year, including all embedded costs",
          },
        ],
      },
      {
        type: "heading",
        content: "Recommended Actions",
        level: 3,
      },
      {
        type: "bullets",
        items: [
          "**[Priority 1]** Fix the three critical issues before any distribution: increase font size to 10pt, add MAS disclaimer to all pages, and expand performance data to required time periods.",
          '**[Priority 2]** Add benchmark comparison to the performance chart — while IMAS Best Practices are non-statutory, failure to comply may be cited by MAS in supervisory proceedings.',
          "**[Priority 3]** Include the Total Expense Ratio (TER) in the fee disclosure section — this is increasingly expected by MAS during routine inspections of marketing materials.",
          "**[Timeline]** These changes should be straightforward — estimated 1–2 business days for design revision. I recommend running the revised factsheet through another compliance review before distribution.",
        ],
      },
      {
        type: "checklist",
        checklist: [
          {
            label: "Fund name and registration number",
            status: "pass",
            detail:
              "Asia Focus VCC (VCC Reg No. T26FC0042A) — correctly displayed",
          },
          {
            label: "Manager and trustee identification",
            status: "pass",
            detail:
              "King Tower Asset Management Pte Ltd (CMS License No. CMS100XXX) identified",
          },
          {
            label: "Investment objective and strategy",
            status: "pass",
            detail:
              "Clearly stated on Page 2 with appropriate risk-return profile",
          },
          {
            label: "MAS review disclaimer",
            status: "fail",
            detail: "Present on Page 1 only — must appear on every page",
          },
          {
            label: "Risk disclaimer font size (≥ 10pt)",
            status: "fail",
            detail:
              "Footer disclaimer text measured at 8pt — below minimum requirement",
          },
          {
            label: "Past performance warning",
            status: "pass",
            detail:
              '"Past performance is not indicative of future performance" statement present',
          },
          {
            label: "Performance presentation periods",
            status: "fail",
            detail:
              "Only 6-month return shown — must include 1, 3, 5, 10-year or since inception",
          },
          {
            label: "Benchmark comparison",
            status: "warning",
            detail:
              "No benchmark index shown alongside fund performance",
          },
          {
            label: "Fee structure disclosure",
            status: "warning",
            detail:
              "Management fee and subscription fee disclosed, but TER is missing",
          },
          {
            label: "Subscription and redemption procedures",
            status: "pass",
            detail:
              "Dealing days, cut-off times, and settlement periods correctly stated",
          },
          {
            label: "Risk factors disclosure",
            status: "pass",
            detail:
              "Market risk, liquidity risk, currency risk, and country-specific risks addressed",
          },
          {
            label: "Contact information and complaints procedure",
            status: "pass",
            detail:
              "Manager contact details and investor complaints procedure included",
          },
          {
            label: "Date of factsheet",
            status: "pass",
            detail:
              "Dated 31 March 2026 — within acceptable recency window",
          },
        ],
      },
      {
        type: "citation",
        citation: {
          text: 'Every advertisement in respect of a collective investment scheme... shall contain a statement that it has not been reviewed by the Authority. The statement must be displayed in a font size no smaller than 10-point Times New Roman or its equivalent.',
          source:
            "Regulation 46(7)–(8), Securities and Futures (Licensing and Conduct of Business) Regulations",
        },
      },
      {
        type: "citation",
        citation: {
          text: "Where performance information is presented, it shall cover discrete annual periods for the most recent 1, 3, 5 and 10 calendar years (or since inception if shorter). Performance shall not be presented for periods shorter than one year in a manner that could mislead investors.",
          source:
            "Code on Collective Investment Schemes (28 November 2025), Appendix 1, Paragraph 4.2",
        },
      },
      {
        type: "citation",
        citation: {
          text: "The total expense ratio of the scheme, including all fees and charges borne by the scheme, shall be disclosed in the product highlights sheet and any marketing material that contains fee information.",
          source:
            "Code on Collective Investment Schemes (28 November 2025), Chapter 7.2",
        },
      },
      {
        type: "citation",
        citation: {
          text: "Where past performance information is presented, it should be accompanied by an appropriate benchmark to enable investors to assess the relative performance of the scheme.",
          source:
            "Investment Management Association of Singapore, Code of Best Practices, Section 3.1",
        },
      },
      {
        type: "status",
        content: "Review completed",
      },
    ],
    showStatus: true,
    suggestedFollowUps: [
      {
        text: "Can you draft the exact MAS disclaimer text I should use on each page?",
      },
      {
        text: "What are the complete performance presentation rules under Code on CIS Appendix 1?",
      },
      {
        text: "Review the revised version once we've made these changes",
      },
    ],
  },
];
