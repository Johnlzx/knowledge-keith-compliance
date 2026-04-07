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
  Mic,
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
  Database,
  ExternalLink,
  CircleDot,
  XCircle,
  Circle,
  Loader2,
  Download,
} from "lucide-react";
// mock-data removed — all responses come from RAG API
import type {
  ComplianceMessage,
  ComplianceMessageBlock,
  ThinkingBlock,
  FindingData,
  ChecklistItem as ChecklistItemType,
  CitationData,
  AttachmentData,
  ReportProgressData,
} from "@/lib/types";

// ── Inline bold parser ──────────────────────────────────────────────
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={j} style={{ fontWeight: 600 }}>
        {part.slice(2, -2)}
      </strong>
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
      case "search":
        return <Search size={13} />;
      case "visit":
        return <Globe size={13} />;
      case "analyze":
        return <BarChart3 size={13} />;
      default:
        return <Search size={13} />;
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full cursor-pointer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          background: "none",
          border: "none",
          color: "var(--color-fg)",
          fontSize: 13,
          fontWeight: 500,
          textAlign: "left",
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={12} color="white" />
        </span>
        <span style={{ flex: 1 }}>{thinking.title}</span>
        {open ? (
          <ChevronDown size={14} style={{ color: "var(--color-fg-tertiary)" }} />
        ) : (
          <ChevronRight size={14} style={{ color: "var(--color-fg-tertiary)" }} />
        )}
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0 14px 12px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--color-fg-secondary)",
              marginTop: 10,
              marginBottom: 8,
            }}
          >
            {thinking.description}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {thinking.steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 6,
                  backgroundColor: "var(--color-surface-hover)",
                  fontSize: 12,
                  color: "var(--color-fg-secondary)",
                }}
              >
                <span style={{ flexShrink: 0, opacity: 0.6 }}>
                  {stepIcon(step.icon)}
                </span>
                {step.text}
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        backgroundColor: "var(--color-surface)",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "var(--color-info-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={18} style={{ color: "var(--color-info)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {attachment.filename}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-fg-tertiary)",
            marginTop: 1,
            fontFamily: "var(--font-mono)",
          }}
        >
          {attachment.filesize} · {attachment.filetype.toUpperCase()}
        </div>
      </div>
      {attachment.status && (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            backgroundColor: "var(--color-pass-bg)",
            color: "var(--color-pass)",
          }}
        >
          {attachment.status === "reviewed"
            ? "Reviewed"
            : attachment.status === "scanning"
              ? "Scanning"
              : "Uploaded"}
        </span>
      )}
    </div>
  );
}

// ── Sidebar attachment (compact) ────────────────────────────────────
function SidebarAttachmentCard({
  attachment,
}: {
  attachment: AttachmentData;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          backgroundColor: "var(--color-info-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={14} style={{ color: "var(--color-info)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {attachment.filename}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--color-fg-tertiary)",
            marginTop: 1,
            fontFamily: "var(--font-mono)",
          }}
        >
          {attachment.filesize} · {attachment.filetype.toUpperCase()}
        </div>
      </div>
      <span
        style={{
          padding: "2px 6px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          backgroundColor: "var(--color-pass-bg)",
          color: "var(--color-pass)",
          flexShrink: 0,
        }}
      >
        Reviewed
      </span>
    </div>
  );
}

// ── Findings grid ───────────────────────────────────────────────────
function FindingsTable({ findings }: { findings: FindingData[] }) {
  const severityConfig: Record<
    string,
    {
      icon: typeof AlertCircle;
      label: string;
      color: string;
      bg: string;
    }
  > = {
    critical: {
      icon: XCircle,
      label: "Critical",
      color: "var(--color-critical)",
      bg: "var(--color-critical-bg)",
    },
    warning: {
      icon: AlertTriangle,
      label: "Warning",
      color: "var(--color-warning)",
      bg: "var(--color-warning-bg)",
    },
    pass: {
      icon: CheckCircle,
      label: "Pass",
      color: "var(--color-pass)",
      bg: "var(--color-pass-bg)",
    },
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        margin: "8px 0",
      }}
    >
      {findings.map((finding, i) => {
        const config = severityConfig[finding.severity];
        const Icon = config.icon;
        return (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 999,
                  backgroundColor: config.bg,
                  color: config.color,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  flexShrink: 0,
                }}
              >
                <Icon size={10} />
                {config.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--color-fg-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {finding.regulation}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-fg)",
                lineHeight: "18px",
                marginBottom: 4,
              }}
            >
              {finding.issue}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-fg-tertiary)",
                lineHeight: "16px",
              }}
            >
              {finding.recommendation}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Citation block ──────────────────────────────────────────────────
function CitationBlock({ citation }: { citation: CitationData }) {
  return (
    <div
      style={{
        borderLeft: "3px solid var(--color-accent)",
        padding: "12px 14px",
        margin: "10px 0",
        backgroundColor: "var(--color-surface)",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <BookOpen
          size={14}
          style={{
            flexShrink: 0,
            marginTop: 2,
            color: "var(--color-accent)",
          }}
        />
        <div>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--color-fg-secondary)",
              fontStyle: "italic",
            }}
          >
            &ldquo;{citation.text}&rdquo;
          </p>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-accent)",
              marginTop: 6,
              fontFamily: "var(--font-mono)",
            }}
          >
            {citation.source}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar checklist ───────────────────────────────────────────────
function SidebarChecklist({ items }: { items: ChecklistItemType[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 6);

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <CheckCircle
            size={13}
            style={{ color: "var(--color-pass)" }}
          />
        );
      case "fail":
        return (
          <XCircle
            size={13}
            style={{ color: "var(--color-critical)" }}
          />
        );
      case "warning":
        return (
          <AlertTriangle
            size={13}
            style={{ color: "var(--color-warning)" }}
          />
        );
      default:
        return (
          <CircleDot
            size={13}
            style={{ color: "var(--color-fg-tertiary)" }}
          />
        );
    }
  };

  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const warnCount = items.filter((i) => i.status === "warning").length;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          backgroundColor: "var(--color-surface-hover)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-fg)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {items.length} items
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{ fontSize: 10, color: "var(--color-pass)", fontFamily: "var(--font-mono)" }}
          >
            {passCount} pass
          </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--color-critical)",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
            }}
          >
            {failCount} fail
          </span>
          {warnCount > 0 && (
            <span
              style={{
                fontSize: 10,
                color: "var(--color-warning)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {warnCount} warn
            </span>
          )}
        </div>
      </div>
      {visibleItems.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderBottom:
              i < visibleItems.length - 1 || (!expanded && items.length > 6)
                ? "1px solid var(--color-border)"
                : "none",
          }}
        >
          {statusIcon(item.status)}
          <span
            style={{
              fontSize: 11,
              color:
                item.status === "fail"
                  ? "var(--color-fg)"
                  : "var(--color-fg-secondary)",
              fontWeight: item.status === "fail" ? 500 : 400,
              flex: 1,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
      {items.length > 6 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full cursor-pointer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "6px 10px",
            background: "none",
            border: "none",
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-fg-tertiary)",
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "var(--font-mono)",
          }}
        >
          {expanded ? "Show less" : `+${items.length - 6} more`}
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
      )}
    </div>
  );
}

// ── Sidebar citation ────────────────────────────────────────────────
function SidebarCitation({ citation }: { citation: CitationData }) {
  return (
    <div
      style={{
        borderLeft: "2px solid var(--color-border)",
        padding: "8px 10px",
        borderRadius: "0 6px 6px 0",
        backgroundColor: "var(--color-surface-hover)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          lineHeight: 1.5,
          color: "var(--color-fg-secondary)",
          fontStyle: "italic",
        }}
      >
        &ldquo;
        {citation.text.length > 120
          ? citation.text.slice(0, 120) + "..."
          : citation.text}
        &rdquo;
      </p>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--color-fg)",
          marginTop: 4,
          fontFamily: "var(--font-mono)",
        }}
      >
        {citation.source}
      </p>
    </div>
  );
}

// ── Report progress card ────────────────────────────────────────────
function ReportProgressCard({ data }: { data: ReportProgressData }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          backgroundColor: "var(--color-accent)",
          color: "white",
        }}
      >
        <Shield size={14} />
        <span
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {data.title}
        </span>
        {data.steps.some((s) => s.status === "active" || s.status === "pending") && (
          <Loader2
            size={14}
            style={{
              animation: "spin 1.5s linear infinite",
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {data.steps.length > 0 && (
        <div style={{ padding: "6px 14px" }}>
          {data.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 0",
                borderBottom:
                  i < data.steps.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              {step.status === "done" ? (
                <CheckCircle
                  size={14}
                  style={{
                    color: "var(--color-pass)",
                    flexShrink: 0,
                  }}
                />
              ) : step.status === "active" ? (
                <span
                  className="animate-pulse-dot"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: "white",
                    }}
                  />
                </span>
              ) : (
                <Circle
                  size={14}
                  style={{
                    color: "var(--color-fg-tertiary)",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: 12,
                  color:
                    step.status === "pending"
                      ? "var(--color-fg-tertiary)"
                      : "var(--color-fg)",
                  fontWeight: step.status === "active" ? 600 : 400,
                  flex: 1,
                }}
              >
                {step.label}
              </span>
              {step.detail && step.status === "active" && (
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--color-fg-tertiary)",
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {step.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {data.report && (
        <div
          style={{
            margin: "2px 14px 10px",
            padding: "8px 10px",
            borderRadius: 8,
            backgroundColor: "var(--color-surface-hover)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={14} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-fg)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.report.filename}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-fg-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {data.report.filesize} · PDF
            </div>
          </div>
          {data.report.status === "generating" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <Loader2
                size={11}
                style={{
                  color: "var(--color-fg-secondary)",
                  animation: "spin 1.5s linear infinite",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--color-fg-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Generating...
              </span>
            </div>
          ) : (
            <button
              className="cursor-pointer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 6,
                backgroundColor: "var(--color-fg)",
                color: "var(--color-bg)",
                border: "none",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
              }}
            >
              <Download size={11} />
              Download
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Block renderer ──────────────────────────────────────────────────
function RenderBlock({ block }: { block: ComplianceMessageBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>
          {renderInlineBold(block.content || "")}
        </p>
      );

    case "heading":
      if (block.level === 2)
        return (
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.3,
              marginTop: 16,
              marginBottom: 4,
              fontFamily: "var(--font-display)",
            }}
          >
            {block.content}
          </h2>
        );
      return (
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.3,
            marginTop: 12,
            marginBottom: 2,
            fontFamily: "var(--font-display)",
          }}
        >
          {block.content}
        </h3>
      );

    case "bullets":
      return (
        <ul style={{ paddingLeft: 4, margin: "4px 0" }}>
          {block.items?.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                display: "flex",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  color: "var(--color-fg-tertiary)",
                }}
              >
                &bull;
              </span>
              <span>{renderInlineBold(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      if (!block.table) return null;
      return (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "hidden",
            margin: "8px 0",
            width: "100%",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {block.table.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: "var(--font-mono)",
                      backgroundColor: "var(--color-surface-hover)",
                      borderBottom: "1px solid var(--color-border)",
                      color: "var(--color-fg-secondary)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "8px 12px",
                        borderBottom:
                          ri < block.table!.rows.length - 1
                            ? "1px solid var(--color-border)"
                            : "none",
                        color: "var(--color-fg-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {renderInlineBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "thinking":
      if (!block.thinking) return null;
      return <ThinkingCard thinking={block.thinking} />;

    case "attachment":
      if (!block.attachment) return null;
      return <AttachmentCard attachment={block.attachment} />;

    case "findings":
      if (!block.findings) return null;
      return <FindingsTable findings={block.findings} />;

    case "citation":
      if (!block.citation) return null;
      return <CitationBlock citation={block.citation} />;

    case "checklist":
      return null; // Rendered in sidebar

    case "report-progress":
      if (!block.reportProgress) return null;
      return <ReportProgressCard data={block.reportProgress} />;

    case "status":
      return null;

    default:
      return null;
  }
}

// ── Status bar ──────────────────────────────────────────────────────
function StatusBar() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        marginTop: 8,
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "var(--color-pass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle2 size={12} color="white" />
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-fg)",
          }}
        >
          Task completed
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-fg-tertiary)",
            marginRight: 4,
          }}
        >
          Rate this result
        </span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="cursor-pointer"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              lineHeight: 1,
            }}
          >
            <Star
              size={16}
              fill={
                star <= (hovered || rating) ? "var(--color-accent)" : "none"
              }
              color={
                star <= (hovered || rating)
                  ? "var(--color-accent)"
                  : "var(--color-fg-tertiary)"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Suggested follow-ups ────────────────────────────────────────────
function FollowUps({
  items,
  onSelect,
}: {
  items: { text: string }[];
  onSelect: (text: string) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--color-fg-tertiary)",
          marginBottom: 6,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Suggested follow-ups
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.text)}
            className="w-full text-left cursor-pointer transition-colors duration-300"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-fg)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
            }}
          >
            <MessageSquare
              size={13}
              style={{
                flexShrink: 0,
                color: "var(--color-fg-tertiary)",
              }}
            />
            <span style={{ flex: 1 }}>{item.text}</span>
            <ArrowRight
              size={13}
              style={{
                flexShrink: 0,
                color: "var(--color-fg-tertiary)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Chat message ────────────────────────────────────────────────────
function ChatMessage({
  message,
  onFollowUp,
}: {
  message: ComplianceMessage;
  onFollowUp: (text: string) => void;
}) {
  if (message.role === "user") {
    const standaloneAttachments = message.blocks.filter(
      (b) => b.type === "attachment"
    );
    const textBlocks = message.blocks.filter((b) => b.type !== "attachment");

    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%]"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {standaloneAttachments.map((b, i) => (
            <div key={`att-${i}`} style={{ width: "100%" }}>
              <RenderBlock block={b} />
            </div>
          ))}
          {textBlocks.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 16,
                fontSize: 14,
                lineHeight: 1.7,
                color: "white",
                backgroundColor: "var(--color-accent)",
              }}
            >
              {textBlocks.map((b, i) => (
                <span key={i}>
                  {b.content}
                  {b.attachment && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                        padding: "4px 10px",
                        borderRadius: 8,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        fontSize: 12,
                        verticalAlign: "top",
                        width: "100%",
                      }}
                    >
                      <FileText
                        size={13}
                        style={{ flexShrink: 0, opacity: 0.8 }}
                      />
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.attachment.filename}
                      </span>
                      <span
                        style={{
                          opacity: 0.6,
                          fontSize: 10,
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {b.attachment.filesize}
                      </span>
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div style={{ maxWidth: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              backgroundColor: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={11} color="white" />
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-fg-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "var(--font-mono)",
            }}
          >
            CosX Compliance
          </span>
        </div>

        <div
          className="space-y-1"
          style={{ color: "var(--color-fg)" }}
        >
          {message.blocks
            .filter((b) => b.type !== "status" && b.type !== "checklist")
            .map((block, i) => (
              <RenderBlock key={i} block={block} />
            ))}
        </div>

        {message.showStatus && <StatusBar />}

        {message.suggestedFollowUps &&
          message.suggestedFollowUps.length > 0 && (
            <FollowUps
              items={message.suggestedFollowUps}
              onSelect={onFollowUp}
            />
          )}
      </div>
    </div>
  );
}



const RAG_API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000";

// ── Main page ───────────────────────────────────────────────────────
export default function ComplianceDemoPage() {
  const [messages, setMessages] = useState<ComplianceMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const askRAG = useCallback(async (question: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${RAG_API_URL}/api/compliance/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const aiMsg: ComplianceMessage = await res.json();
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ComplianceMessage = {
        id: Date.now().toString() + "-err",
        role: "ai",
        blocks: [
          {
            type: "text",
            content: `Unable to reach the compliance API. Please ensure the RAG backend is running at ${RAG_API_URL}.\n\nError: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMsg: ComplianceMessage = {
      id: Date.now().toString(),
      role: "user",
      blocks: [{ type: "text", content: trimmed }],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    askRAG(trimmed);
  }, [input, isLoading, askRAG]);

  const handleFollowUp = useCallback((text: string) => {
    if (isLoading) return;
    const userMsg: ComplianceMessage = {
      id: Date.now().toString(),
      role: "user",
      blocks: [{ type: "text", content: text }],
    };
    setMessages((prev) => [...prev, userMsg]);
    askRAG(text);
  }, [isLoading, askRAG]);

  return (
    <div
      className="flex"
      style={{
        height: "calc(100vh - var(--nav-height))",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Chat column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFollowUp={handleFollowUp}
              />
            ))}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Loader2 size={14} color="white" className="animate-spin" />
                </div>
                <span style={{
                  fontSize: 13, color: "var(--color-fg-secondary)",
                  fontFamily: "var(--font-body)",
                }}>
                  Searching regulations and generating response...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          style={{
            flexShrink: 0,
            padding: "8px 20px 16px",
            backgroundColor: "var(--color-bg)",
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                backgroundColor: "var(--color-surface)",
                padding: "8px 12px",
              }}
            >
              <button
                className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors duration-300 cursor-pointer"
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Plus size={14} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={() => {
                  const t = textareaRef.current;
                  if (t) {
                    t.style.height = "auto";
                    t.style.height =
                      Math.min(t.scrollHeight, 120) + "px";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about MAS compliance requirements..."
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  backgroundColor: "transparent",
                  fontSize: 14,
                  lineHeight: 1.6,
                  outline: "none",
                  border: "none",
                  color: "var(--color-fg)",
                  minHeight: 34,
                  padding: "5px 0",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-300"
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: "transparent",
                  border: "none",
                  color: "var(--color-fg-tertiary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-fg)";
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    "var(--color-fg-tertiary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Mic size={14} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 flex items-center justify-center rounded-full text-white transition-all duration-300 cursor-pointer"
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: "var(--color-accent)",
                  border: "none",
                  opacity: input.trim() && !isLoading ? 1 : 0.4,
                }}
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
