"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  Star,
  Plus,
  CheckCircle2,
  Search,
  Globe,
  BarChart3,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Shield,
  BookOpen,
  XCircle,
  Circle,
  Loader2,
  Download,
  Upload,
  X,
  PanelLeftClose,
  PanelLeft,
  Paperclip,
} from "lucide-react";
import type {
  ComplianceMessage,
  ComplianceMessageBlock,
  ThinkingBlock,
  FindingData,
  CitationData,
  AttachmentData,
  ReportProgressData,
  ConversationSession,
} from "@/lib/types";
import { reviewMockMessages } from "@/lib/review-mock-data";
import { qaMockMessages } from "@/lib/qa-mock-data";
import {
  askCompliance,
  createConversation,
  listConversations as apiListConversations,
  getConversation as apiGetConversation,
  uploadReview,
} from "@/lib/api";

// ── Demo sessions (shown only when no persisted conversations exist) ──
const demoSessions: ConversationSession[] = [
  {
    id: "s-review-1",
    type: "review",
    title: "Asia Focus VCC Q1 2026 Factsheet",
    createdAt: "2026-04-08T10:30:00Z",
    messages: reviewMockMessages,
    document: { filename: "Asia_Focus_VCC_Q1_2026_Factsheet.pdf", filesize: "2.4 MB", pages: 12 },
  },
  {
    id: "s-qa-1",
    type: "qa",
    title: "CIS font size & disclaimer requirements",
    createdAt: "2026-04-08T09:15:00Z",
    messages: qaMockMessages,
  },
];

// ── Inline bold parser ──────────────────────────────────────────────
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={j} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={j}>{part}</span>
    )
  );
}

// ── Thinking card ───────────────────────────────────────────────────
function ThinkingCard({ thinking }: { thinking: ThinkingBlock }) {
  const [open, setOpen] = useState(false);
  const stepIcon = (icon: string) => {
    switch (icon) {
      case "search": return <Search size={13} />;
      case "visit": return <Globe size={13} />;
      case "analyze": return <BarChart3 size={13} />;
      default: return <Search size={13} />;
    }
  };
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden", marginTop: 8, marginBottom: 8 }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full cursor-pointer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", color: "var(--color-fg)", fontSize: 13, fontWeight: 500, textAlign: "left", fontFamily: "var(--font-body)" }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckCircle2 size={12} color="white" />
        </span>
        <span style={{ flex: 1 }}>{thinking.title}</span>
        {open ? <ChevronDown size={14} style={{ color: "var(--color-fg-tertiary)" }} /> : <ChevronRight size={14} style={{ color: "var(--color-fg-tertiary)" }} />}
      </button>
      {open && (
        <div className="animate-fade-in" style={{ padding: "0 14px 12px", borderTop: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-fg-secondary)", marginTop: 10, marginBottom: 8 }}>{thinking.description}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {thinking.steps.map((step: { icon: string; text: string }, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 6, backgroundColor: "var(--color-surface-hover)", fontSize: 12, color: "var(--color-fg-secondary)" }}>
                <span style={{ flexShrink: 0, opacity: 0.6 }}>{stepIcon(step.icon)}</span>{step.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Attachment card ─────────────────────────────────────────────────
function AttachmentCard({ attachment }: { attachment: AttachmentData }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "1px solid var(--color-border)", borderRadius: 10, backgroundColor: "var(--color-surface)", marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "var(--color-info-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={18} style={{ color: "var(--color-info)" }} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{attachment.filename}</div>
        <div style={{ fontSize: 11, color: "var(--color-fg-tertiary)", marginTop: 1, fontFamily: "var(--font-mono)" }}>{attachment.filesize} &middot; {attachment.filetype.toUpperCase()}</div>
      </div>
      {attachment.status && (
        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "var(--color-pass-bg)", color: "var(--color-pass)" }}>
          {attachment.status === "reviewed" ? "Reviewed" : attachment.status === "scanning" ? "Scanning" : "Uploaded"}
        </span>
      )}
    </div>
  );
}


// ── Findings grid ───────────────────────────────────────────────────
function FindingsTable({ findings, citations }: { findings: FindingData[]; citations?: CitationData[] }) {
  const [activeCitations, setActiveCitations] = useState<CitationData[] | null>(null);
  const cfg: Record<string, { icon: typeof AlertCircle; label: string; color: string; bg: string }> = {
    critical: { icon: XCircle, label: "Critical", color: "var(--color-critical)", bg: "var(--color-critical-bg)" },
    warning: { icon: AlertTriangle, label: "Warning", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
    pass: { icon: CheckCircle, label: "Pass", color: "var(--color-pass)", bg: "var(--color-pass-bg)" },
  };

  const findMatchingCitations = (finding: FindingData): CitationData[] => {
    if (!citations || citations.length === 0) return [];
    // Match by regulation keyword overlap
    const regWords = finding.regulation.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    return citations.filter((c) => {
      const src = c.source.toLowerCase();
      return regWords.some((w) => src.includes(w));
    });
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
        {findings.map((f, i) => { const c = cfg[f.severity]; const Icon = c.icon; const matched = findMatchingCitations(f); return (
          <div key={i} style={{ padding: "12px 14px", border: "1px solid var(--color-border)", borderRadius: 10, backgroundColor: "var(--color-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, backgroundColor: c.bg, color: c.color, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}><Icon size={10} />{c.label}</span>
              <span style={{ fontSize: 10, color: "var(--color-fg-tertiary)", fontFamily: "var(--font-mono)" }}>{f.regulation}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", lineHeight: "18px", marginBottom: 4 }}>{f.issue}</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-secondary)", lineHeight: 1.6, marginBottom: matched.length > 0 ? 8 : 0 }}>{f.recommendation}</div>
            {matched.length > 0 && (
              <button
                onClick={() => setActiveCitations(matched)}
                className="cursor-pointer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-hover)", color: "var(--color-accent)", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-accent)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; e.currentTarget.style.color = "var(--color-accent)"; }}
              >
                <BookOpen size={11} />
                View Regulation
              </button>
            )}
          </div>
        ); })}
      </div>
      {activeCitations && <CitationModal citations={activeCitations} onClose={() => setActiveCitations(null)} />}
    </>
  );
}

// ── Citation modal ─────────────────────────────────────────────────
function CitationModal({ citations, onClose }: { citations: CitationData[]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: 560, maxHeight: "80vh", overflow: "auto", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 0, position: "relative" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={16} style={{ color: "var(--color-accent)" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-fg)", fontFamily: "var(--font-display)" }}>Regulatory References</span>
          </div>
          <button onClick={onClose} className="cursor-pointer" style={{ background: "none", border: "none", color: "var(--color-fg-tertiary)", padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {citations.map((citation, i) => (
            <div key={i} style={{ borderLeft: "3px solid var(--color-accent)", padding: "14px 16px", backgroundColor: "var(--color-surface)", borderRadius: "0 10px 10px 0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{citation.source}</p>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-fg)", fontStyle: "italic" }}>&ldquo;{citation.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Report progress card ────────────────────────────────────────────
function ReportProgressCard({ data }: { data: ReportProgressData }) {
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden", marginTop: 4, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", backgroundColor: "var(--color-accent)", color: "white" }}>
        <Shield size={14} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{data.title}</span>
        {data.steps.some((s: { status: string }) => s.status === "active" || s.status === "pending") && <Loader2 size={14} style={{ animation: "spin 1.5s linear infinite", opacity: 0.7 }} />}
      </div>
      {data.steps.length > 0 && (
        <div style={{ padding: "6px 14px" }}>
          {data.steps.map((step: { label: string; status: string; detail?: string }, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < data.steps.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              {step.status === "done" ? <CheckCircle size={14} style={{ color: "var(--color-pass)", flexShrink: 0 }} /> : step.status === "active" ? (
                <span className="animate-pulse-dot" style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "white" }} /></span>
              ) : <Circle size={14} style={{ color: "var(--color-fg-tertiary)", flexShrink: 0 }} />}
              <span style={{ fontSize: 12, color: step.status === "pending" ? "var(--color-fg-tertiary)" : "var(--color-fg)", fontWeight: step.status === "active" ? 600 : 400, flex: 1 }}>{step.label}</span>
              {step.detail && step.status === "active" && <span style={{ fontSize: 10, color: "var(--color-fg-tertiary)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{step.detail}</span>}
            </div>
          ))}
        </div>
      )}
      {data.report && (
        <div style={{ margin: "2px 14px 10px", padding: "8px 10px", borderRadius: 8, backgroundColor: "var(--color-surface-hover)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={14} color="white" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.report.filename}</div>
            <div style={{ fontSize: 10, color: "var(--color-fg-tertiary)", fontFamily: "var(--font-mono)" }}>{data.report.filesize} &middot; PDF</div>
          </div>
          {data.report.status === "generating" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}><Loader2 size={11} style={{ color: "var(--color-fg-secondary)", animation: "spin 1.5s linear infinite" }} /><span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-fg-secondary)", fontFamily: "var(--font-mono)" }}>Generating...</span></div>
          ) : (
            <button className="cursor-pointer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, backgroundColor: "var(--color-fg)", color: "var(--color-bg)", border: "none", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)" }}><Download size={11} />Download</button>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Block renderer ──────────────────────────────────────────────────
function RenderBlock({ block, citations }: { block: ComplianceMessageBlock; citations?: CitationData[] }) {
  switch (block.type) {
    case "text": return <p style={{ fontSize: 14, lineHeight: 1.7 }}>{renderInlineBold(block.content || "")}</p>;
    case "heading":
      if (block.level === 2) return <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginTop: 16, marginBottom: 4, fontFamily: "var(--font-display)" }}>{block.content}</h2>;
      return <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginTop: 12, marginBottom: 2, fontFamily: "var(--font-display)" }}>{block.content}</h3>;
    case "bullets":
      return (<ul style={{ paddingLeft: 4, margin: "4px 0" }}>{block.items?.map((item: string, i: number) => (<li key={i} style={{ fontSize: 14, lineHeight: 1.7, display: "flex", gap: 8, marginBottom: 4 }}><span style={{ flexShrink: 0, marginTop: 2, color: "var(--color-fg-tertiary)" }}>&bull;</span><span>{renderInlineBold(item)}</span></li>))}</ul>);
    case "table":
      if (!block.table) return null;
      return (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, overflow: "hidden", margin: "8px 0", width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{block.table.headers.map((h: string, i: number) => (<th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", backgroundColor: "var(--color-surface-hover)", borderBottom: "1px solid var(--color-border)", color: "var(--color-fg-secondary)" }}>{h}</th>))}</tr></thead>
            <tbody>{block.table.rows.map((row: string[], ri: number) => (<tr key={ri}>{row.map((cell: string, ci: number) => (<td key={ci} style={{ padding: "8px 12px", borderBottom: ri < block.table!.rows.length - 1 ? "1px solid var(--color-border)" : "none", color: "var(--color-fg-secondary)", lineHeight: 1.5 }}>{renderInlineBold(cell)}</td>))}</tr>))}</tbody>
          </table>
        </div>
      );
    case "thinking": return block.thinking ? <ThinkingCard thinking={block.thinking} /> : null;
    case "attachment": return block.attachment ? <AttachmentCard attachment={block.attachment} /> : null;
    case "findings": return block.findings ? <FindingsTable findings={block.findings} citations={citations} /> : null;
    case "citation": return null; // Citations are now shown as popups in findings
    case "checklist":
      if (!block.checklist) return null;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "8px 0" }}>
          {block.checklist.map((item, i) => {
            const color = item.status === "pass" ? "var(--color-pass)" : item.status === "fail" ? "var(--color-critical)" : "var(--color-warning)";
            const bg = item.status === "pass" ? "var(--color-pass-bg)" : item.status === "fail" ? "var(--color-critical-bg)" : "var(--color-warning-bg)";
            const Icon = item.status === "pass" ? CheckCircle : item.status === "fail" ? XCircle : AlertTriangle;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <Icon size={14} style={{ color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>{item.label}</span>
                {item.detail && <span style={{ fontSize: 11, color: "var(--color-fg-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{item.detail}</span>}
                <span style={{ padding: "2px 6px", borderRadius: 999, fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: bg, color }}>{item.status}</span>
              </div>
            );
          })}
        </div>
      );
    case "report-progress": return block.reportProgress ? <ReportProgressCard data={block.reportProgress} /> : null;
    case "status": return null;
    default: return null;
  }
}

// ── Status bar ──────────────────────────────────────────────────────
function StatusBar() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", marginTop: 8, borderTop: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "var(--color-pass)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={12} color="white" /></span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>Task completed</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 12, color: "var(--color-fg-tertiary)", marginRight: 4 }}>Rate this result</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} className="cursor-pointer" style={{ background: "none", border: "none", padding: 0, lineHeight: 1 }}>
            <Star size={16} fill={star <= (hovered || rating) ? "var(--color-accent)" : "none"} color={star <= (hovered || rating) ? "var(--color-accent)" : "var(--color-fg-tertiary)"} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Follow-ups ──────────────────────────────────────────────────────
function FollowUps({ items, onSelect }: { items: { text: string }[]; onSelect: (t: string) => void }) {
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-fg-tertiary)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested follow-ups</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => onSelect(item.text)} className="w-full text-left cursor-pointer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-fg)", fontSize: 13, fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}>
            <MessageSquare size={13} style={{ flexShrink: 0, color: "var(--color-fg-tertiary)" }} />
            <span style={{ flex: 1 }}>{item.text}</span>
            <ArrowRight size={13} style={{ flexShrink: 0, color: "var(--color-fg-tertiary)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Chat message ────────────────────────────────────────────────────
function ChatMessage({ message, onFollowUp }: { message: ComplianceMessage; onFollowUp: (t: string) => void }) {
  if (message.role === "user") {
    const attBlocks = message.blocks.filter((b) => b.type === "attachment");
    const textBlocks = message.blocks.filter((b) => b.type !== "attachment");
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {attBlocks.map((b, i) => <div key={`a-${i}`} style={{ width: "100%" }}><RenderBlock block={b} /></div>)}
          {textBlocks.length > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.7, color: "white", backgroundColor: "var(--color-accent)" }}>
              {textBlocks.map((b, i) => (
                <span key={i}>{b.content}{b.attachment && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 10px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", fontSize: 12, verticalAlign: "top", width: "100%" }}>
                    <FileText size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.attachment.filename}</span>
                    <span style={{ opacity: 0.6, fontSize: 10, flexShrink: 0, fontFamily: "var(--font-mono)" }}>{b.attachment.filesize}</span>
                  </span>
                )}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  // Collect all citations from this message for passing to findings
  const messageCitations = message.blocks
    .filter((b) => b.type === "citation" && b.citation)
    .map((b) => b.citation!);

  return (
    <div className="flex justify-start">
      <div style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Shield size={11} color="white" /></span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>CosX Compliance</span>
        </div>
        <div className="space-y-1" style={{ color: "var(--color-fg)" }}>
          {message.blocks.filter((b) => b.type !== "status" && b.type !== "checklist").map((block, i) => <RenderBlock key={i} block={block} citations={messageCitations} />)}
        </div>
        {message.showStatus && <StatusBar />}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && <FollowUps items={message.suggestedFollowUps} onSelect={onFollowUp} />}
      </div>
    </div>
  );
}


// ── Upload overlay ──────────────────────────────────────────────────
function UploadOverlay({ onClose, onUpload }: { onClose: () => void; onUpload: (file?: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: 440, backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 28, position: "relative" }}>
        <button onClick={onClose} className="cursor-pointer" style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "var(--color-fg-tertiary)", padding: 4 }}>
          <X size={16} />
        </button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={22} style={{ color: "var(--color-accent)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-fg)", fontFamily: "var(--font-display)", marginBottom: 6 }}>New Compliance Review</h2>
            <p style={{ fontSize: 13, color: "var(--color-fg-secondary)", lineHeight: 1.5 }}>Upload a fund factsheet to review against MAS requirements</p>
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); dragRef.current++; setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); dragRef.current--; if (dragRef.current <= 0) { dragRef.current = 0; setIsDragOver(false); } }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); dragRef.current = 0; setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) onUpload(f); }}
            className="cursor-pointer"
            style={{ width: "100%", minHeight: 140, border: `2px dashed ${isDragOver ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: 12, backgroundColor: isDragOver ? "var(--color-surface-hover)" : "var(--color-surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24, transition: "all 200ms ease" }}
          >
            <Upload size={20} style={{ color: isDragOver ? "var(--color-accent)" : "var(--color-fg-secondary)" }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>{isDragOver ? "Drop here" : "Drop PDF here or click to browse"}</p>
            <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--color-border)" }} />
            <span style={{ fontSize: 11, color: "var(--color-fg-tertiary)", fontFamily: "var(--font-mono)" }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--color-border)" }} />
          </div>
          <button onClick={() => onUpload()} className="cursor-pointer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-fg)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}>
            <FileText size={15} style={{ color: "var(--color-fg-secondary)" }} />
            Try with sample factsheet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function ComplianceDemoPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>(demoSessions);
  const [activeId, setActiveId] = useState<string>(demoSessions[0].id);
  const [showUpload, setShowUpload] = useState(false);
  const [input, setInput] = useState("");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeSession?.messages.length, scrollToBottom]);

  // Load persisted conversations from backend on mount
  useEffect(() => {
    apiListConversations()
      .then((list) => {
        if (list.length > 0) {
          const loaded: ConversationSession[] = list.map((c) => ({
            id: c.id,
            type: c.type as "qa" | "review",
            title: c.title,
            createdAt: c.created_at,
            messages: [], // lazy-loaded when selected
          }));
          setSessions([...loaded, ...demoSessions]);
          setActiveId(loaded[0].id);
        }
      })
      .catch(() => { /* backend offline — keep demo sessions */ });
  }, []);

  // Load full messages when switching to a persisted conversation
  const loadConversationMessages = useCallback(async (id: string) => {
    // Skip demo sessions (they start with "s-")
    if (id.startsWith("s-")) return;
    try {
      const detail = await apiGetConversation(id);
      const messages: ComplianceMessage[] = detail.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "ai",
        blocks: m.content,
        showStatus: m.role === "ai",
      }));
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, messages } : s)),
      );
    } catch { /* ignore load errors */ }
  }, []);

  const createSession = useCallback(async () => {
    try {
      const conv = await createConversation("New Conversation", "qa");
      const newSession: ConversationSession = { id: conv.id, type: "qa", title: conv.title, createdAt: conv.created_at, messages: [] };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(conv.id);
    } catch {
      const id = `s-${Date.now()}`;
      const newSession: ConversationSession = { id, type: "qa", title: "New Conversation", createdAt: new Date().toISOString(), messages: [] };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(id);
    }
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleFileUpload = useCallback(async (file?: File) => {
    setShowUpload(false);

    // No file → use demo mock data
    if (!file) {
      const id = `s-review-${Date.now()}`;
      const newSession: ConversationSession = {
        id, type: "review", title: "Asia Focus VCC Q1 2026 Factsheet", createdAt: new Date().toISOString(),
        messages: reviewMockMessages,
        document: { filename: "Asia_Focus_VCC_Q1_2026_Factsheet.pdf", filesize: "2.4 MB", pages: 12 },
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(id);
      return;
    }

    const fileSize = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const userMsg: ComplianceMessage = {
      id: Date.now().toString(), role: "user",
      blocks: [{
        type: "attachment",
        attachment: { filename: file.name, filesize: fileSize, filetype: "pdf", status: "uploaded" },
      }],
    };

    // If current session exists and is persisted, upload into it
    const currentId = activeId;
    const isPersistedSession = currentId && !currentId.startsWith("s-");

    if (isPersistedSession) {
      setSessions((prev) => prev.map((s) => s.id === currentId ? { ...s, messages: [...s.messages, userMsg], type: "review" } : s));
      setIsLoading(true);
      try {
        const aiMsg = await uploadReview(file, currentId);
        setSessions((prev) => prev.map((s) => s.id === currentId ? { ...s, messages: [...s.messages, aiMsg] } : s));
      } catch (err) {
        const errMsg: ComplianceMessage = {
          id: `err-${Date.now()}`, role: "ai",
          blocks: [{ type: "text", content: `Review failed: ${err instanceof Error ? err.message : "Unknown error"}` }],
        };
        setSessions((prev) => prev.map((s) => s.id === currentId ? { ...s, messages: [...s.messages, errMsg] } : s));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Create a new session for the upload
    try {
      const conv = await createConversation(file.name, "review");
      const newSession: ConversationSession = {
        id: conv.id, type: "review", title: file.name, createdAt: conv.created_at,
        messages: [userMsg],
        document: { filename: file.name, filesize: fileSize, pages: 0 },
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(conv.id);
      setIsLoading(true);

      const aiMsg = await uploadReview(file, conv.id);
      setSessions((prev) => prev.map((s) => s.id === conv.id ? { ...s, messages: [...s.messages, aiMsg] } : s));
    } catch (err) {
      const errMsg: ComplianceMessage = {
        id: `err-${Date.now()}`, role: "ai",
        blocks: [{ type: "text", content: `Review failed: ${err instanceof Error ? err.message : "Unknown error"}` }],
      };
      setSessions((prev) => {
        const last = prev[0];
        if (last && last.type === "review") {
          return [{ ...last, messages: [...last.messages, errMsg] }, ...prev.slice(1)];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeId]);

  const sendQuestion = useCallback(async (question: string) => {
    if (!activeId) return;
    setIsLoading(true);
    try {
      // Pass conversation_id for persisted sessions (demo sessions start with "s-")
      const convId = activeId.startsWith("s-") ? undefined : activeId;
      const aiMsg = await askCompliance(question, convId);
      setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...s.messages, aiMsg] } : s));
    } catch (err) {
      const errMsg: ComplianceMessage = {
        id: `err-${Date.now()}`, role: "ai",
        blocks: [{ type: "text", content: `Request failed: ${err instanceof Error ? err.message : "Unknown error"}` }],
      };
      setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...s.messages, errMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  }, [activeId]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !activeId || isLoading) return;
    const userMsg: ComplianceMessage = { id: Date.now().toString(), role: "user", blocks: [{ type: "text", content: trimmed }] };
    setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? trimmed.slice(0, 40) : s.title } : s));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendQuestion(trimmed);
  }, [input, activeId, isLoading, sendQuestion]);

  const handleFollowUp = useCallback((text: string) => {
    if (!activeId || isLoading) return;
    const userMsg: ComplianceMessage = { id: Date.now().toString(), role: "user", blocks: [{ type: "text", content: text }] };
    setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...s.messages, userMsg] } : s));
    sendQuestion(text);
  }, [activeId, isLoading, sendQuestion]);

  return (
    <div className="flex" style={{ height: "calc(100vh - var(--nav-height))", backgroundColor: "var(--color-bg)" }}>
      {/* ── Left: Session list ──────────────────────────────────────── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: leftCollapsed ? 48 : 260, borderRight: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-secondary)", transition: "width 200ms ease", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: leftCollapsed ? "14px 10px 10px" : "14px 14px 10px", display: "flex", alignItems: "center", justifyContent: leftCollapsed ? "center" : "space-between" }}>
          {!leftCollapsed && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>Conversations</span>}
          <button onClick={createSession} className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-fg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}>
            <Plus size={14} />
          </button>
        </div>

        {/* Session cards */}
        <div className="flex-1 overflow-y-auto" style={{ padding: leftCollapsed ? "0 6px 16px" : "0 8px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sessions.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button key={s.id} onClick={() => { setActiveId(s.id); loadConversationMessages(s.id); if (leftCollapsed) return; }} className="w-full text-left cursor-pointer" style={{ display: "flex", alignItems: "center", gap: leftCollapsed ? 0 : 10, padding: leftCollapsed ? "8px 0" : "10px 10px", borderRadius: 8, border: "none", backgroundColor: isActive ? "var(--color-surface-hover)" : "transparent", color: "var(--color-fg)", fontFamily: "var(--font-body)", transition: "background-color 100ms ease", justifyContent: leftCollapsed ? "center" : "flex-start" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <span style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MessageSquare size={13} style={{ color: "var(--color-fg-tertiary)" }} />
                  </span>
                  {!leftCollapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: "var(--color-fg-tertiary)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                        {s.messages.length} msgs
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapse toggle */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: leftCollapsed ? "center" : "flex-end" }}>
          <button onClick={() => setLeftCollapsed((v) => !v)} className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-fg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            {leftCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* ── Center: Chat ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {activeSession ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
                {activeSession.messages.map((msg) => <ChatMessage key={msg.id} message={msg} onFollowUp={handleFollowUp} />)}
                {isLoading && (
                  <div className="flex justify-start">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Shield size={11} color="white" /></span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>CosX Compliance</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                        <span className="loading-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-fg-tertiary)", animation: "loading-bounce 1.4s ease-in-out infinite", animationDelay: "0s" }} />
                        <span className="loading-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-fg-tertiary)", animation: "loading-bounce 1.4s ease-in-out infinite", animationDelay: "0.2s" }} />
                        <span className="loading-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-fg-tertiary)", animation: "loading-bounce 1.4s ease-in-out infinite", animationDelay: "0.4s" }} />
                      </div>
                      <style>{`@keyframes loading-bounce { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
                    </div>
                  </div>
                )}
                {activeSession.messages.length === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 120, gap: 16, color: "var(--color-fg-tertiary)" }}>
                    <Shield size={32} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: 14 }}>Ask a compliance question or upload a document for review</p>
                    <button onClick={() => setShowUpload(true)} className="cursor-pointer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-fg-secondary)", fontSize: 13, fontFamily: "var(--font-body)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}>
                      <Upload size={14} />
                      Upload PDF for Review
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: "8px 20px 16px", backgroundColor: "var(--color-bg)" }}>
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, border: "1px solid var(--color-border)", borderRadius: 12, backgroundColor: "var(--color-surface)", padding: "8px 12px" }}>
                  <button onClick={() => setShowUpload(true)} disabled={isLoading} className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer" style={{ width: 30, height: 30, backgroundColor: "transparent", border: "none", color: "var(--color-fg-tertiary)", opacity: isLoading ? 0.4 : 1 }}
                    onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.backgroundColor = "var(--color-surface-hover)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                    title="Upload PDF for compliance review">
                    <Paperclip size={15} />
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} style={{ display: "none" }} />
                  <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                    onInput={() => { const t = textareaRef.current; if (t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; } }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask about MAS compliance or upload a document for review..."
                    rows={1} style={{ flex: 1, resize: "none", backgroundColor: "transparent", fontSize: 14, lineHeight: 1.6, outline: "none", border: "none", color: "var(--color-fg)", minHeight: 34, padding: "5px 0", fontFamily: "var(--font-body)" }} />
                  <button onClick={handleSend} disabled={!input.trim() || isLoading} className="flex-shrink-0 flex items-center justify-center rounded-full text-white cursor-pointer" style={{ width: 30, height: 30, backgroundColor: "var(--color-accent)", border: "none", opacity: input.trim() && !isLoading ? 1 : 0.4 }}>
                    <ArrowUp size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-fg-tertiary)" }}>
            <p style={{ fontSize: 14 }}>Select or create a conversation</p>
          </div>
        )}
      </div>

      {/* Right panel removed — chat flow contains all necessary info */}

      {/* ── Upload overlay ─────────────────────────────────────────── */}
      {showUpload && <UploadOverlay onClose={() => setShowUpload(false)} onUpload={handleFileUpload} />}
    </div>
  );
}
