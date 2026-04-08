# RAG 项目架构详解 — 以 Keith Compliance Agent 为例

> 面向非 AI 工程背景的读者，用这个实际项目解释 RAG 系统的每一层

---

## 一、为什么需要 RAG？

先理解一个核心问题：

```
直接问 ChatGPT："新加坡 CIS 广告的免责声明最小字号是多少？"

ChatGPT 回答："建议咨询法律顾问获取具体要求。"  ← 没用

为什么？因为 ChatGPT 的训练数据里不一定有这份法规的细节，
即使有也不敢确定，怕回答错误。
```

**RAG（Retrieval-Augmented Generation，检索增强生成）** 解决这个问题的思路：

```
不要让 LLM 凭记忆回答，而是：
1. 先去知识库里搜出相关的法规原文
2. 把原文喂给 LLM
3. LLM 只基于这些原文来回答

这样 LLM 的回答就有据可查、可以引用出处。
```

用一个比喻：

```
没有 RAG 的 LLM = 闭卷考试（凭记忆，容易编造）
有 RAG 的 LLM   = 开卷考试（翻书回答，有据可查）
```

---

## 二、整体架构 — 两条数据流

理解了这两条线就理解了全局：

### 流程 A：入库（Ingestion）—— 只做一次，准备知识库

```
23 份 PDF ──→ 拆成文本页 ──→ 切成小块 ──→ 转成向量 ──→ 存入数据库
(14MB)       (1815 页)     (3435 块)    (数学表示)    (ChromaDB)

对应代码：
01-Raw-Regulations/*.pdf → rag/ingest.py → 02-Processed/chroma_db/

触发方式：
python run_ingest.py
```

### 流程 B：问答（Query）—— 每次用户提问时

```
用户问题 ──→ 转成向量 ──→ 在数据库中找相似块 ──→ 组装 prompt ──→ Claude 回答
"字号要求"   (数学表示)   (找到 6 个最相关的)    (问题+原文)     (带引用)

对应代码：
前端 page.tsx → rag/api.py → rag/retriever.py → rag/chain.py → Claude API
```

### 代码文件与数据流的对应关系

```
┌─────────────────────────────────────────────────────────┐
│ 入库流程 (run_ingest.py)                                 │
│                                                          │
│   PDF 文件                                               │
│     │                                                    │
│     ▼                                                    │
│   ingest.py: extract_text_from_pdf()  ← 第 1 层：PDF 解析 │
│     │                                                    │
│     ▼                                                    │
│   ingest.py: chunk_documents()        ← 第 2 层：文本分块  │
│     │                                                    │
│     ▼                                                    │
│   ingest.py: build_vectorstore()      ← 第 3 层：向量化    │
│     │                                                    │
│     ▼                                                    │
│   ChromaDB (02-Processed/chroma_db/)  ← 第 4 层：向量数据库│
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 问答流程 (run_api.py)                                    │
│                                                          │
│   用户问题 (前端 fetch)                                    │
│     │                                                    │
│     ▼                                                    │
│   api.py: compliance_chat()           ← 第 7 层：API 端点  │
│     │                                                    │
│     ▼                                                    │
│   retriever.py: retrieve()            ← 第 5 层：检索     │
│     │                                                    │
│     ▼                                                    │
│   chain.py: ask()                     ← 第 6 层：Prompt   │
│     │                                                    │
│     ▼                                                    │
│   Claude API → JSON 回答               生成带引用的回答     │
│     │                                                    │
│     ▼                                                    │
│   前端 page.tsx 渲染                   ← 第 8 层：前端展示  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 三、逐层详解

### 第 1 层：PDF 解析

**文件：** `rag/ingest.py` → `extract_text_from_pdf()`

**做什么：** 把 PDF 文件变成纯文本。

```python
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        # → {"text": "...", "metadata": {"source": "Code on CIS", "page": 45}}
```

**输入：** 一份 PDF 文件（如 `Code_on_CIS_Nov2025.pdf`，104 页）

**输出：** 104 个 `{text, metadata}` 对象，每个对应一页的纯文本

**为什么用 pdfplumber 而不是 PyPDF2？** 因为法规 PDF 有复杂的表格和多列布局，pdfplumber 对表格的提取更准确。

**这一步的产出：** 全部 23 份 PDF → 1815 个页面文本。

---

### 第 2 层：文本分块（Chunking）

**文件：** `rag/ingest.py` → `chunk_documents()`

**做什么：** 把长文本切成小块，每块约 1500 字符。

```python
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,      # 每块最多 1500 字符
    chunk_overlap=200,    # 块之间重叠 200 字符
    separators=["\n\n", "\n", ". ", " ", ""],
)
```

**为什么要分块？**

一页 PDF 可能有 3000 字，但其中可能只有一段话跟用户的问题相关。如果整页塞给 LLM：
- 噪音太多，LLM 可能抓不住重点
- 浪费 token 费用
- 检索精度下降

分成小块后，检索更精准 —— 只返回最相关的那一小段。

**关键参数的含义：**

```
chunk_size = 1500
├── 太大（如 5000）→ 检索不精准，噪音多
├── 太小（如 200） → 上下文不完整，法规条文被切断
└── 1500 是法规文档的平衡点：大约一个完整的法条段落

chunk_overlap = 200
└── 块与块之间重叠 200 字符
    防止一个条款刚好在切割点被截断
    比如一个条款在第 1400 字处开始，
    没有 overlap 的话下一块就丢了开头

separators = ["\n\n", "\n", ". ", " ", ""]
└── 优先在段落换行处切割，其次在句号处，
    最后才按字符硬切
    这样尽量保持句子完整性
```

**这一步的产出：** 1815 页 → 3435 个 chunks，每个带 `source`、`page`、`chunk_index` 元数据。

---

### 第 3 层：向量化（Embedding）

**文件：** `rag/ingest.py` → `build_vectorstore()` 中调用

**做什么：** 把文本变成一组数字（向量），让计算机能计算"语义相似度"。

```python
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
```

**什么是向量？**

```
"minimum font size for disclaimers"
    ↓ embedding 模型
[0.023, -0.156, 0.891, 0.034, ..., -0.221]   ← 384 维向量

"字体大小最低要求"
    ↓ embedding 模型
[0.019, -0.148, 0.887, 0.041, ..., -0.215]   ← 数值很接近！

"liquidity risk management"
    ↓ embedding 模型
[0.567, 0.234, -0.123, 0.789, ..., 0.456]    ← 数值差异大
```

**核心原理：** 语义相似的文本，向量在高维空间中距离近。这样用户问"字号要求"时，能找到包含"font size"的法规段落，即使措辞完全不同。这就是向量搜索比关键词搜索强大的地方。

**关键词搜索 vs. 向量搜索：**

```
关键词搜索：WHERE text LIKE '%font size%'
├── "字号" 搜不到 "font size"
├── "最小字体要求" 搜不到 "minimum font size"
└── 只能精确匹配，不理解含义

向量搜索：similarity_search("字号要求", k=6)
├── "字号" 能找到 "font size"（语义相近）
├── 理解同义词、多语言
└── 按相似度排序，最相关的排最前
```

**为什么选 `all-MiniLM-L6-v2` 这个模型？**

```
优点：
├── 本地运行，不需要 API key，不花钱
├── 速度快，模型小（~80MB）
├── 对英文文档效果足够好
└── 开源，无供应商锁定

缺点：
├── 中文支持一般
└── 精度不如 OpenAI text-embedding-3-large

生产环境可升级为：
├── OpenAI text-embedding-3-large（更准，但收费）
└── Cohere embed-multilingual-v3（多语言更好）
```

---

### 第 4 层：向量数据库（ChromaDB）

**文件：** `rag/ingest.py` → `build_vectorstore()`

**做什么：** 把所有向量和元数据存起来，支持高效的相似度搜索。

```python
vectorstore = Chroma.from_texts(
    texts=texts,          # 3435 段文本
    metadatas=metadatas,  # 每段的来源、页码
    embedding=embeddings, # 用什么模型算向量
    persist_directory=str(CHROMA_PERSIST_DIR),  # 存到磁盘
)
```

**ChromaDB 是什么？**

一个轻量的向量数据库，把向量和元数据存在本地 SQLite 文件里。类似于"专门为向量搜索设计的数据库"。

**为什么不用普通数据库？**

```
MySQL:    SELECT * FROM regulations WHERE text LIKE '%font size%'
          → 只能关键词匹配，搜不到语义相似的内容

ChromaDB: vectorstore.similarity_search("字号要求", k=6)
          → 语义搜索，在 3435 个块中找出最相关的 6 个
          → 返回每个结果的相似度分数
```

**数据存储结构：**

```
02-Processed/chroma_db/
├── chroma.sqlite3         ← 元数据（来源、页码等）
└── *.bin                  ← 向量数据（384维浮点数数组）
    总大小约 50MB
```

**生产环境替代方案：**

| 数据库 | 特点 | 适用场景 |
|--------|------|---------|
| ChromaDB | 本地文件，零配置 | POC、小规模 |
| Pinecone | 云托管，全管理 | 中等规模，不想运维 |
| Weaviate | 开源，自托管 | 需要更多控制 |
| Milvus | 分布式，高性能 | 大规模（百万级向量） |
| pgvector | PostgreSQL 插件 | 已有 PG 基础设施 |

---

### 第 5 层：检索（Retrieval）

**文件：** `rag/retriever.py`

**做什么：** 用户提问时，在向量库中找到最相关的文档块。

```python
def retrieve(query: str, top_k: int = 6) -> list[dict]:
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=top_k)
    # 返回 6 个最相关的文本块 + 相似度分数
```

**`top_k=6` 的选择逻辑：**

```
为什么是 6？
├── 太少（如 2）→ 可能漏掉重要条款，回答不完整
├── 太多（如 20）→ 塞太多噪音给 LLM，浪费 token，干扰回答质量
└── 6 块 × 1500 字/块 = ~9000 字上下文
    Claude 的上下文窗口有 200K token，9000 字很轻松
```

**`score`（相似度分数）的含义：**

```
分数是余弦距离：
├── 0.0 ~ 0.5  → 非常相关（几乎是在说同一件事）
├── 0.5 ~ 1.0  → 比较相关（主题相关）
├── 1.0 ~ 1.5  → 弱相关（有一些关联）
└── 1.5 ~ 2.0  → 不相关
```

**实际检索示例：**

```
查询："minimum font size for disclaimers in CIS factsheet"

结果：
1. SFA CIS Regulations, Page 38  (score: 0.73) ← 非常相关
   "...must be in a font size of at least 10-point Arial..."

2. SFA CIS Regulations, Page 37  (score: 0.78) ← 很相关
   "...the information in the product highlights sheet..."

3. IMAS Code, Page 8  (score: 0.87) ← 相关
   "...font size of footnotes is required to be at least..."

4-6. 其他相关段落...
```

---

### 第 6 层：Prompt 工程（最关键）

**文件：** `rag/chain.py`

**做什么：** 把检索到的文档块 + 用户问题组装成 prompt，发给 Claude 生成回答。

**这是整个系统最关键的部分。** RAG 的输出质量 80% 取决于 prompt 设计。

#### System Prompt 设计

```python
SYSTEM_PROMPT = """You are an expert compliance advisor...

CRITICAL RULES:
1. ONLY answer based on the provided context.
   ← 防止 LLM 编造答案

2. ALWAYS cite the specific regulation source.
   ← 强制每个结论都有出处

3. Quote the exact original regulatory text VERBATIM.
   ← 必须逐字引用法规原文，不能意译

4. If the context does not contain enough information, say so.
   ← 不知道就说不知道，不要猜

RESPONSE FORMAT:
{
  "answer": "...",
  "citations": [{"source": "...", "page": N, "excerpt": "原文"}],
  "confidence": "high" | "medium" | "low",
  "follow_ups": ["相关追问1", "相关追问2"]
}
"""
```

**每条规则为什么重要：**

```
规则 1 "ONLY based on context"
├── 没有这条 → LLM 可能混入训练数据中的知识，无法追溯来源
└── 有这条 → 确保每个回答都来自我们的法规库

规则 2 "ALWAYS cite"
├── 没有这条 → "字号要求是 10pt"（谁说的？哪条法规？）
└── 有这条 → "字号要求是 10pt [SFA CIS Regulations, Page 38]"

规则 3 "VERBATIM quote"
├── 没有这条 → LLM 可能意译："大约需要 10 号字体左右"
└── 有这条 → 直接引用原文："must be in a font size of at least 10-point Arial"

规则 4 "say so if insufficient"
├── 没有这条 → LLM 可能编造一个看似合理但错误的答案
└── 有这条 → "Based on the available context, I cannot find specific provisions on this topic."
```

#### 发给 Claude 的完整消息

```
[System] 你是合规专家，规则如上...

[Human]  REGULATORY CONTEXT:
         --- Source 1: SFA CIS Regulations, Page 38 ---
         (b) the information in the product highlights sheet...
         must be in a font size of at least 10-point Arial...

         --- Source 2: IMAS Code, Page 8 ---
         the font size of footnotes is required to be at least
         ½ the font size of the main text...

         --- Source 3-6: ... ---

         COMPLIANCE QUESTION:
         What is the minimum font size for disclaimers?
```

**Claude 只看这 6 段上下文回答，不会凭空编造。**

#### 为什么要求 JSON 输出？

```
自由格式输出：
"根据法规，最小字号是 10pt Arial。来源是 SFA CIS Regulations。"
→ 前端很难解析出哪部分是引用、哪部分是回答

JSON 输出：
{
  "answer": "最小字号是 10pt Arial [SFA CIS Regulations, Page 38]",
  "citations": [{"source": "SFA CIS Regulations", "page": 38, "excerpt": "..."}]
}
→ 前端可以精确地渲染：文本用普通样式，引用用紫色边框卡片
```

#### Confidence 字段的设计

```
"high"   → 在上下文中找到了明确的法规条文
           用户可以直接作为合规依据

"medium" → 相关内容不够完整，或需要推理
           建议用户进一步确认

"low"    → 检索到的内容与问题关联度低
           建议用户换个问法或查阅原文
```

---

### 第 7 层：API 层

**文件：** `rag/api.py`

**做什么：** 把 RAG chain 的输出包装成 REST API，供前端调用。

```python
@app.post("/api/compliance/chat")
def compliance_chat(req: QuestionRequest):
    result = ask(req.question)          # 调用 RAG chain
    # 把 result 转换成前端的 ComplianceMessage 格式
    # 包含：thinking steps、answer text、citations、follow-ups
    return message
```

**三个端点各自的用途：**

```
GET  /api/health
└── 健康检查。部署平台用来判断服务是否存活。

POST /api/compliance/ask
└── 原始 RAG 输出。返回 {answer, citations, confidence}
    给开发者调试用。

POST /api/compliance/chat
└── 前端专用格式。返回 ComplianceMessage 对象，
    包含 thinking、text、citation、status 等 block 类型。
    前端拿到后直接渲染不同的 UI 组件。
```

**为什么有两个问答端点？**

这是一个常见的设计模式叫 **BFF（Backend for Frontend）**：

```
/ask  → 通用 API，输出结构简单，任何客户端都能用
/chat → 专门为这个前端设计的格式，省去前端的数据转换逻辑
```

**API 层还做了什么？**

```
1. 从检索结果中提取 thinking steps
   → "Searched Code on CIS (Page 45)"
   → "Searched IMAS Code (Page 8)"
   → "Cross-referencing regulatory provisions"

2. 把 Claude 返回的 citations 转成 CitationBlock
   → { type: "citation", citation: { text: "原文...", source: "来源" } }

3. 把 Claude 生成的 follow-ups 转成前端的 suggestedFollowUps
   → [{ text: "What about digital advertising?" }]
```

---

### 第 8 层：前端

**文件：** `demo/src/app/page.tsx`

**做什么：** 聊天界面 + 接收 API 返回的结构化数据 + 渲染不同类型的内容块。

#### 用户操作流程

```
1. 用户在输入框输入问题
2. handleSend() 触发
3. 先显示用户消息
4. 显示 loading 动画 "Searching regulations..."
5. fetch() 调用后端 /api/compliance/chat
6. 收到 ComplianceMessage JSON
7. 渲染 AI 回答（多个 block）
8. 显示 follow-up 建议按钮
```

#### Block 类型与渲染组件

前端最核心的设计是 **Block 架构** —— AI 的回答不是一段纯文本，而是由多种类型的"块"组成：

```
ComplianceMessage
└── blocks: [
      { type: "thinking",  ... }  → ThinkingCard     展开/收起的思考过程
      { type: "text",      ... }  → 普通文本段落       主要回答内容
      { type: "heading",   ... }  → 标题              分节标题
      { type: "bullets",   ... }  → 列表              要点列表
      { type: "table",     ... }  → 表格              对比表格
      { type: "citation",  ... }  → CitationBlock     法规原文引用卡片
      { type: "findings",  ... }  → FindingsTable     合规发现（严重/警告/通过）
      { type: "checklist", ... }  → ChecklistItems    合规检查清单
      { type: "status",    ... }  → 状态标签           完成/置信度
    ]
```

**为什么用 Block 架构而不是 Markdown？**

```
Markdown 方案：
AI 返回一大段 markdown → 前端用 react-markdown 渲染
├── 优点：实现简单
├── 缺点：引用卡片、检查清单、严重度标签等复杂 UI 无法实现
└── 用户体验：像看文档，不像用产品

Block 方案：
AI 返回结构化 JSON → 前端按类型渲染不同组件
├── 引用有紫色边框 + BookOpen 图标
├── Critical 发现有红色标签
├── 检查清单有 ✓/✗ 状态
└── 用户体验：专业、结构清晰、可交互
```

---

## 四、部署架构

```
┌──────────────────────────────────────────────────────┐
│                    用户浏览器                          │
└────────────────────────┬─────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────┐
│  Vercel (前端)                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ Next.js Static Export                         │    │
│  │ - 纯静态 HTML/JS/CSS                          │    │
│  │ - 不跑服务端代码                               │    │
│  │ - 浏览器端 fetch() 调用后端 API                 │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────┘
                         │ HTTPS (跨域 CORS)
                         ▼
┌──────────────────────────────────────────────────────┐
│  Railway (后端)                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │ Docker Container                              │    │
│  │ ┌────────────┐ ┌────────────┐ ┌───────────┐  │    │
│  │ │  FastAPI    │ │  ChromaDB  │ │ Embedding │  │    │
│  │ │  (API 层)   │ │  (向量库)   │ │  Model    │  │    │
│  │ └─────┬──────┘ └────────────┘ └───────────┘  │    │
│  │       │                                       │    │
│  └───────┼───────────────────────────────────────┘    │
└──────────┼───────────────────────────────────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────────────────────────────┐
│  Anthropic API (或代理)                                │
│  Claude Sonnet → 生成带引用的回答                       │
└──────────────────────────────────────────────────────┘
```

**为什么前后端分离部署？**

```
前端 (Vercel)                 后端 (Railway)
├── 免费额度大                 ├── 需要 Python 运行时
├── 全球 CDN，毫秒级响应        ├── 需要持久化存储（向量库 50MB）
├── 纯静态文件，零运维          ├── 需要调用外部 API（Claude）
├── 自动 HTTPS                ├── 有计算开销（embedding 计算）
└── 适合展示层                 └── 适合计算层

把不同的工作负载放在最适合它的平台上。
```

**Docker 的作用：**

```
Dockerfile 做了什么：
1. FROM python:3.11-slim       ← 基础 Python 环境
2. pip install requirements    ← 安装依赖
3. COPY rag/ + PDFs            ← 复制代码和法规文件
4. RUN python run_ingest.py    ← 在构建时完成向量化（重要！）
5. CMD python run_api.py       ← 启动 API 服务

关键：向量化在 build 阶段完成，不是在运行时。
这意味着容器启动后立即可用，不需要等几分钟入库。
```

---

## 五、关键设计决策总结

| 决策点 | 我们的选择 | 为什么 | 替代方案 |
|--------|-----------|--------|---------|
| Embedding 模型 | all-MiniLM-L6-v2 (本地) | 免费、快速、够用 | OpenAI embedding (更准、付费) |
| 向量数据库 | ChromaDB (本地文件) | 零配置、轻量 | Pinecone (云托管、更稳) |
| LLM | Claude Sonnet | 长上下文、回答质量高 | GPT-4、Gemini |
| 分块大小 | 1500 字符 | 法规段落的平衡点 | 根据文档调整 |
| 检索数量 | top_k=6 | 覆盖度与噪音的平衡 | 可调整 |
| 输出格式 | JSON (结构化) | 前端需要渲染不同组件 | Markdown (更简单) |
| 前端架构 | Block 类型系统 | 丰富的 UI 表现力 | 纯文本聊天 |
| 部署 | Vercel + Railway | 各取所长，成本低 | 全部自托管 |

---

## 六、扩展方向

```
当前 (POC)                       未来 (Production)
───────────────────────          ─────────────────────────────
ChromaDB (本地文件)           →   Pinecone (云托管，更快更稳)
MiniLM (本地 embedding)      →   OpenAI text-embedding-3 (更准)
单一 prompt                  →   Multi-step Agent (拆解复杂问题)
纯问答                       →   文档审查 (上传 PDF 逐项检查)
新加坡 MAS 法规               →   多司法管辖区 (香港 SFC / 英国 FCA)
无对话记忆                    →   对话历史 + 上下文追踪
无用户认证                    →   JWT 认证 + 用量计费
```
