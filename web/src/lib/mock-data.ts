import type { ComplianceMessage } from "./types";

export const complianceDemoMessages: ComplianceMessage[] = [
  // ── Round 1: User question ──────────────────────────────────────
  {
    id: "cd-m1",
    role: "user",
    blocks: [
      {
        type: "text",
        content:
          "What are the mandatory font size and disclaimer requirements when advertising a Collective Investment Scheme to retail investors in Singapore?",
      },
    ],
  },

  // ── Round 1: Agent response ─────────────────────────────────────
  {
    id: "cd-m2",
    role: "ai",
    blocks: [
      {
        type: "text",
        content:
          "Let me research the specific advertising requirements under the MAS regulatory framework for CIS marketing materials.",
      },
      {
        type: "thinking",
        thinking: {
          title: "Analyzing MAS advertising requirements for CIS",
          description:
            "Cross-referencing multiple regulatory sources to compile the complete set of font size and disclaimer obligations for CIS advertisements directed at retail investors.",
          steps: [
            {
              icon: "search",
              text: "Searched MAS FAQs on Fair and Balanced Advertising for CIS",
            },
            {
              icon: "visit",
              text: "Reviewed Regulation 46 of Securities and Futures (Licensing and Conduct of Business) Regulations",
            },
            {
              icon: "analyze",
              text: "Cross-referenced Code on CIS (Nov 2025) Appendix 1 disclosure requirements",
            },
            {
              icon: "visit",
              text: "Checked MAS Guidelines on Standards of Conduct for Digital Advertising (FSG-03, effective Mar 2026)",
            },
          ],
        },
      },
      {
        type: "heading",
        content: "CIS Advertising Requirements — Font & Disclaimer Rules",
        level: 2,
      },
      {
        type: "text",
        content:
          "Under Singapore's regulatory framework, any advertisement for a Collective Investment Scheme directed at retail investors must comply with strict formatting and disclosure requirements. Here is a comprehensive summary:",
      },
      {
        type: "table",
        table: {
          headers: ["Requirement", "Specification", "Regulatory Source"],
          rows: [
            [
              "Minimum font size",
              "**10-point Times New Roman** or equivalent legible typeface",
              "Reg 46(7) SF(LCB)R",
            ],
            [
              "MAS disclaimer",
              '"**This advertisement has not been reviewed by the Monetary Authority of Singapore.**"',
              "Reg 46(8) SF(LCB)R",
            ],
            [
              "Disclaimer placement",
              "Must be **prominent and legible**; for digital ads with space constraints, may be placed on the linked webpage",
              "MAS FAQ Q3.5",
            ],
            [
              "Past performance warning",
              '"**Past performance is not necessarily indicative of future performance**"',
              "Code on CIS, Appendix 1",
            ],
            [
              "Fair & balanced presentation",
              "Risk disclosures must be **given equal prominence** to potential benefits — not buried in footnotes or small print",
              "Reg 46(1) SF(LCB)R",
            ],
            [
              "Electronic media legibility",
              "Font must be **clearly readable on the display medium** used; scrolling disclaimers are not acceptable",
              "MAS FAQ Q3.3",
            ],
          ],
        },
      },
      {
        type: "citation",
        citation: {
          text: '"Every advertisement in respect of a collective investment scheme... shall contain a statement that it has not been reviewed by the Authority." The statement must be displayed in a font size no smaller than 10-point Times New Roman or its equivalent.',
          source:
            "Regulation 46(7)–(8), Securities and Futures (Licensing and Conduct of Business) Regulations",
        },
      },
      {
        type: "heading",
        content: "Practical Guidance",
        level: 3,
      },
      {
        type: "bullets",
        items: [
          "The **10-point minimum** applies to all required disclaimers and risk warnings, not just the MAS review statement. If your factsheet uses 9pt or 8pt for footnotes containing risk disclosures, this is non-compliant.",
          "For **social media advertisements** (e.g., Instagram, LinkedIn), where character limits apply, the MAS disclaimer may be placed on the landing page — but the ad itself must not be misleading without it.",
          'The **new Digital Advertising Guidelines (FSG-03)**, effective 25 March 2026, add requirements for board-level accountability and monitoring of digital marketing channels, including **finfluencer arrangements**.',
          "Advertisements directed exclusively at **Accredited Investors (AIs)** or **Institutional Investors (IIs)** are exempt from Regulation 46 requirements, but must still not contain false or misleading statements under Section 300 SFA.",
          "All marketing materials must undergo **internal compliance approval** before distribution. MAS expects a documented approval workflow with clear accountability.",
        ],
      },
      {
        type: "status",
        content: "Task completed",
      },
    ],
    showStatus: true,
    suggestedFollowUps: [
      {
        text: "What are the specific rules for digital and social media advertising under the new FSG-03 guidelines?",
      },
      {
        text: "Are there exemptions for materials distributed only to Accredited Investors?",
      },
      {
        text: "What penalties apply if we distribute non-compliant advertising material?",
      },
    ],
  },

  // ── Round 2: Cross-regulation question ─────────────────────────
  {
    id: "cd-m5",
    role: "user",
    blocks: [
      {
        type: "text",
        content:
          "We want to distribute our solar energy fund to accredited investors only. What are the disclosure requirements and exemptions that apply?",
      },
    ],
  },

  // ── Round 2: Cross-regulation response ─────────────────────────
  {
    id: "cd-m6",
    role: "ai",
    blocks: [
      {
        type: "text",
        content:
          "Great question — distributing exclusively to Accredited Investors (AIs) unlocks several exemptions, but certain obligations remain. Let me trace through the relevant provisions across multiple regulations.",
      },
      {
        type: "thinking",
        thinking: {
          title: "Cross-referencing AI exemptions across SFA, Code on CIS, and MAS Guidelines",
          description:
            "Analyzing the interplay between SFA Part XIII prospectus exemptions, Code on CIS disclosure requirements, and MAS Guidelines on Fund Management Companies to provide a complete picture of the AI-only distribution regime.",
          steps: [
            {
              icon: "search",
              text: "Searched SFA Part XIII, Division 2 — Prospectus exemptions for offers to Accredited Investors (s305)",
            },
            {
              icon: "visit",
              text: "Reviewed Code on CIS Chapter 3 — Authorization and notification requirements for restricted schemes",
            },
            {
              icon: "analyze",
              text: "Cross-referenced MAS FAQs on Offers of Shares, Debentures and CIS — AI opt-in requirements",
            },
            {
              icon: "visit",
              text: "Checked MAS Guidelines on FMC (SFA 04-G05) — ongoing obligations for AI-only funds",
            },
            {
              icon: "analyze",
              text: "Reviewed Code on CIS Appendix 6 — Information Memorandum disclosure standards for restricted schemes",
            },
          ],
        },
      },
      {
        type: "heading",
        content: "AI-Only Distribution — Exemptions & Remaining Obligations",
        level: 2,
      },
      {
        type: "heading",
        content: "Prospectus Exemption (SFA s305)",
        level: 3,
      },
      {
        type: "text",
        content:
          "Under **Section 305 SFA**, an offer of units in a CIS made to **Accredited Investors only** is exempt from the requirement to register a prospectus with MAS. This is the primary exemption that makes AI-only distribution commercially attractive — it significantly reduces time-to-market and regulatory compliance burden.",
      },
      {
        type: "citation",
        citation: {
          text: '"An offer of units in a collective investment scheme shall be exempt from the requirement to register a prospectus under section 296 if... the offer is made to an accredited investor, as defined in section 4A of the SFA."',
          source:
            "Securities and Futures Act 2001, Section 305(1)(a)",
        },
      },
      {
        type: "heading",
        content: "Key Requirements That Still Apply",
        level: 3,
      },
      {
        type: "table",
        table: {
          headers: ["Obligation", "Details", "Source"],
          rows: [
            [
              "AI opt-in confirmation",
              "Each investor must **consent in writing** to be treated as an AI and acknowledge reduced protections",
              "SFA s4A(1)(b), MAS FAQ Q2.3",
            ],
            [
              "Information Memorandum",
              "While not a registered prospectus, an **IM must still be provided** containing material disclosures per Code on CIS Appendix 6",
              "Code on CIS, Chapter 3.5",
            ],
            [
              "Anti-fraud provisions",
              "**Section 300 SFA** (false or misleading statements) applies regardless of investor type — all materials must be factually accurate",
              "SFA s300",
            ],
            [
              "MAS notification",
              "The fund manager must **notify MAS** within 14 days of the first offer under the s305 exemption",
              "SFA s305(5)",
            ],
            [
              "Ongoing fund management obligations",
              "Custody, valuation, conflicts of interest, and reporting obligations under **MAS Guidelines SFA 04-G05** apply in full",
              "MAS Guidelines FMC, Chapters 4–8",
            ],
            [
              "AML/CFT checks",
              "Full **KYC and AML/CFT** due diligence required for all investors regardless of AI status",
              "MAS Notice SFA 04-N02",
            ],
          ],
        },
      },
      {
        type: "heading",
        content: "What You Are Exempt From",
        level: 3,
      },
      {
        type: "bullets",
        items: [
          "**Prospectus registration** with MAS (SFA s296) — replaced by an Information Memorandum",
          "**Regulation 46 advertising requirements** — font size, MAS disclaimer, and fair presentation rules do not apply to materials distributed solely to AIs",
          "**MAS authorization/recognition** of the scheme — an AI-only fund may operate as a restricted scheme under Code on CIS Chapter 3",
          "**Product Highlights Sheet** — not required for offers made under s305 to AIs only",
        ],
      },
      {
        type: "citation",
        citation: {
          text: "A restricted scheme offered only to accredited investors and relevant persons need not be authorized or recognized by the Authority under Part XIII Division 1 of the SFA. The manager shall, however, comply with the ongoing operational and risk management obligations set out in these Guidelines.",
          source:
            "MAS Guidelines on Licensing, Registration and Conduct of Business for Fund Management Companies (SFA 04-G05), Chapter 3, Para 3.2.1",
        },
      },
      {
        type: "heading",
        content: "Practical Considerations for Your Solar Energy Fund",
        level: 3,
      },
      {
        type: "bullets",
        items: [
          "**Ensure written AI opt-in** from every investor before subscription — this is frequently tested by MAS during inspections and is a common audit finding.",
          "**Prepare a robust Information Memorandum** — even though it's not a registered prospectus, MAS expects it to contain all material risks, fees, investment strategy, and manager qualifications. For a solar energy fund, include specific ESG-related risk disclosures.",
          "**Do not commingle materials** — if you later wish to distribute to retail investors, you'll need a separate registered prospectus and all Regulation 46 advertising rules will apply to those materials.",
          "**Maintain clear records** of AI status verification for each investor — MAS may request these during routine inspections or thematic reviews.",
        ],
      },
      {
        type: "status",
        content: "Task completed",
      },
    ],
    showStatus: true,
    suggestedFollowUps: [
      {
        text: "What should our Information Memorandum contain for a solar energy fund specifically?",
      },
      {
        text: "What are the ongoing reporting obligations for AI-only restricted schemes?",
      },
      {
        text: "Can we later convert from AI-only to retail distribution? What would that require?",
      },
    ],
  },

  // ── Round 3: User with attachment ───────────────────────────────
  {
    id: "cd-m3",
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

  // ── Round 3: Agent generating report (progress version) ────────
  {
    id: "cd-m3b",
    role: "ai",
    variant: "progress",
    blocks: [
      {
        type: "report-progress",
        reportProgress: {
          title: "Generating Compliance Report",
          steps: [
            { label: "Parsing document — 12 pages, 4 sections", status: "done" },
            { label: "Extracting text and visual elements", status: "done" },
            { label: "Checking SFA & SF(LCB)R requirements", status: "done" },
            { label: "Checking Code on CIS (Nov 2025)", status: "done" },
            { label: "Checking IMAS Best Practices", status: "done" },
            {
              label: "Compiling findings",
              status: "active",
              detail: "3 critical, 2 warnings identified",
            },
            { label: "Generating final report", status: "pending" },
          ],
          report: {
            filename: "Compliance_Review_Asia_Focus_VCC_Q1_2026.pdf",
            filesize: "340 KB",
            status: "generating",
          },
        },
      },
    ],
  },

  // ── Round 3: Agent report ready (compact version) ──────────────
  {
    id: "cd-m3c",
    role: "ai",
    variant: "compact",
    blocks: [
      {
        type: "text",
        content:
          "I've completed the compliance review of your factsheet against all four regulatory frameworks. Here's the report:",
      },
      {
        type: "report-progress",
        reportProgress: {
          title: "Compliance Review Report",
          steps: [],
          report: {
            filename: "Compliance_Review_Asia_Focus_VCC_Q1_2026.pdf",
            filesize: "340 KB",
            status: "ready",
          },
        },
      },
    ],
  },

  // ── Round 3: Agent compliance review ────────────────────────────
  {
    id: "cd-m4",
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
        content: "Full Compliance Checklist",
        level: 3,
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
            label: "Risk disclaimer font size (\u2265 10pt)",
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
            detail: "No benchmark index shown alongside fund performance",
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
          "**[Timeline]** These changes should be straightforward — estimated 1\u20132 business days for design revision. I recommend running the revised factsheet through another compliance review before distribution.",
          "**[Process note]** Ensure the revised factsheet goes through your firm's internal compliance approval workflow before distribution, as required under the IMAS Code and MAS Guidelines on Fund Management Companies (SFA04-G05).",
        ],
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

// ── Right sidebar data ────────────────────────────────────────────

export const knowledgeBaseSources = [
  { name: "Securities and Futures Act 2001", abbr: "SFA", pages: "~700 pages" },
  { name: "Code on CIS (Nov 2025)", abbr: "CIS Code", pages: "~500 pages" },
  { name: "IMAS Code of Best Practices", abbr: "IMAS", pages: "~80 pages" },
  { name: "MAS Digital Advertising Guidelines", abbr: "FSG-03", pages: "~45 pages" },
  { name: "MAS FAQs on Fair Advertising", abbr: "FAQ", pages: "~40 pages" },
  { name: "MAS Guidelines for FMCs", abbr: "SFA 04-G05", pages: "~60 pages" },
];
