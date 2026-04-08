import type { ComplianceMessage } from "./types";

export const qaMockMessages: ComplianceMessage[] = [
  {
    id: "qa-m1",
    role: "user",
    blocks: [
      {
        type: "text",
        content:
          "What are the mandatory font size and disclaimer requirements when advertising a Collective Investment Scheme to retail investors in Singapore?",
      },
    ],
  },
  {
    id: "qa-m2",
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
            { icon: "search", text: "Searched MAS FAQs on Fair and Balanced Advertising for CIS" },
            { icon: "visit", text: "Reviewed Regulation 46 of Securities and Futures (Licensing and Conduct of Business) Regulations" },
            { icon: "analyze", text: "Cross-referenced Code on CIS (Nov 2025) Appendix 1 disclosure requirements" },
            { icon: "visit", text: "Checked MAS Guidelines on Standards of Conduct for Digital Advertising (FSG-03, effective Mar 2026)" },
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
            ["Minimum font size", "**10-point Times New Roman** or equivalent legible typeface", "Reg 46(7) SF(LCB)R"],
            ["MAS disclaimer", '**"This advertisement has not been reviewed by the Monetary Authority of Singapore."**', "Reg 46(8) SF(LCB)R"],
            ["Disclaimer placement", "Must be **prominent and legible**; for digital ads with space constraints, may be placed on the linked webpage", "MAS FAQ Q3.5"],
            ["Past performance warning", 'Must state **"Past performance is not necessarily indicative of future performance"**', "Code on CIS, Appendix 1"],
            ["Fair & balanced presentation", "Risk disclosures must be **given equal prominence** to potential benefits — not buried in footnotes or small print", "Reg 46(1) SF(LCB)R"],
            ["Electronic media legibility", "Font must be **clearly readable on the display medium** used; scrolling disclaimers are not acceptable", "MAS FAQ Q3.3"],
          ],
        },
      },
      {
        type: "citation",
        citation: {
          text: '"Every advertisement in respect of a collective investment scheme... shall contain a statement that it has not been reviewed by the Authority." The statement must be displayed in a font size no smaller than 10-point Times New Roman or its equivalent.',
          source: "Regulation 46(7)–(8), Securities and Futures (Licensing and Conduct of Business) Regulations",
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
          "The **10-point minimum** applies to all required disclaimers and risk warnings, not just the MAS review statement.",
          "For **social media advertisements**, the MAS disclaimer may be placed on the landing page — but the ad itself must not be misleading without it.",
          "The **new Digital Advertising Guidelines (FSG-03)**, effective 25 March 2026, add requirements for board-level accountability and monitoring of digital marketing channels.",
          "Advertisements directed exclusively at **Accredited Investors (AIs)** or **Institutional Investors (IIs)** are exempt from Regulation 46 requirements.",
        ],
      },
      { type: "status", content: "Task completed" },
    ],
    showStatus: true,
    suggestedFollowUps: [
      { text: "What are the specific rules for digital and social media advertising under the new FSG-03 guidelines?" },
      { text: "Are there exemptions for materials distributed only to Accredited Investors?" },
      { text: "What penalties apply if we distribute non-compliant advertising material?" },
    ],
  },
];
