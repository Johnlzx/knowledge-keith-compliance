export interface ThinkingStep {
  icon: "search" | "visit" | "analyze";
  text: string;
}

export interface ThinkingBlock {
  title: string;
  description: string;
  steps: ThinkingStep[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface AttachmentData {
  filename: string;
  filesize: string;
  filetype: "pdf" | "docx" | "xlsx";
  status?: "uploaded" | "scanning" | "reviewed";
}

export interface FindingData {
  severity: "critical" | "warning" | "pass";
  issue: string;
  location: string;
  regulation: string;
  recommendation: string;
}

export interface ChecklistItem {
  label: string;
  status: "pass" | "fail" | "warning";
  detail?: string;
}

export interface CitationData {
  text: string;
  source: string;
}

export interface ReportProgressStep {
  label: string;
  status: "done" | "active" | "pending";
  detail?: string;
}

export interface ReportProgressData {
  title: string;
  steps: ReportProgressStep[];
  report?: {
    filename: string;
    filesize: string;
    status: "ready" | "generating";
  };
}

export interface ComplianceMessageBlock {
  type:
    | "text"
    | "heading"
    | "bullets"
    | "table"
    | "thinking"
    | "status"
    | "attachment"
    | "findings"
    | "citation"
    | "checklist"
    | "report-progress";
  content?: string;
  items?: string[];
  table?: TableData;
  thinking?: ThinkingBlock;
  level?: number;
  attachment?: AttachmentData;
  findings?: FindingData[];
  citation?: CitationData;
  checklist?: ChecklistItem[];
  reportProgress?: ReportProgressData;
}

export interface SuggestedFollowUp {
  text: string;
}

export interface ComplianceMessage {
  id: string;
  role: "user" | "ai";
  blocks: ComplianceMessageBlock[];
  suggestedFollowUps?: SuggestedFollowUp[];
  showStatus?: boolean;
  variant?: "progress" | "compact";
}
