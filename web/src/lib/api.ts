import type { ComplianceMessage } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `API error ${res.status}`);
  }
  return res.json();
}

// ── Compliance chat ─────────────────────────────────────────────────

export async function askCompliance(
  question: string,
  conversationId?: string,
): Promise<ComplianceMessage> {
  return apiFetch("/api/compliance/chat", {
    method: "POST",
    body: JSON.stringify({ question, conversation_id: conversationId }),
  });
}

// ── Conversation CRUD ───────────────────────────────────────────────

export interface ConversationSummary {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  messages: { id: string; role: string; content: ComplianceMessage["blocks"]; created_at: string }[];
}

export async function createConversation(
  title: string = "New Q&A",
  type: string = "qa",
): Promise<{ id: string; title: string; type: string; created_at: string }> {
  return apiFetch("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ title, type }),
  });
}

export async function listConversations(): Promise<ConversationSummary[]> {
  return apiFetch("/api/conversations");
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return apiFetch(`/api/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<void> {
  return apiFetch(`/api/conversations/${id}`, { method: "DELETE" });
}

// ── Document Review ─────────────────────────────────────────────────

export async function uploadReview(
  file: File,
  conversationId?: string,
): Promise<ComplianceMessage> {
  const form = new FormData();
  form.append("file", file);
  if (conversationId) form.append("conversation_id", conversationId);

  const res = await fetch(`${API_BASE}/api/compliance/review`, {
    method: "POST",
    body: form,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `API error ${res.status}`);
  }

  return res.json();
}
