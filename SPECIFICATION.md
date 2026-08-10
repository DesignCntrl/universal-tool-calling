# UTC Specification v1.0

**Universal Tool Calling** is a deterministic detection cascade that enables tool invocation from natural language, independent of the LLM's ability to generate structured function calls.

---

## 1. Overview

UTC provides a 3-layer cascade for detecting and executing tool calls from user messages:

1. **Layer 0 — Model Detection**: The LLM generates structured `tool_calls` in its response. If present, execute directly.
2. **Layer 1 — Hard Keyword Detection**: Simple substring matching on the user's original message. High confidence (0.95), instant execution.
3. **Layer 2 — Regex Pattern Detection**: Case-insensitive regex matching on the user's original message. Slightly lower confidence (0.90).

**Critical design principle:** Layers 1 and 2 operate on the **user's message**, not the model's response. This means tool detection happens independently of the model's output.

---

## 2. Trigger Table

The trigger table defines which patterns map to which tools. The table is scanned top-to-bottom. **First match wins.**

### Priority Order

| Priority | Tool | Reason |
|----------|------|--------|
| 1 | `generate_image` | Image generation is unambiguous |
| 2 | `web_search` | URL fetch is a subset of web search |
| 3 | `search_memory` | Memory operations are read/write |
| 4 | `list_documents` | Document listing is a read operation |
| 5 | `read_document` | Document reading requires a name |

### Entry Format

Each trigger entry has:

```typescript
{
  tool: string;              // Tool name to dispatch
  patterns: string[];        // Case-insensitive regex patterns
  extract: (match: RegExpMatchArray, fullText: string) => Record<string, unknown>;
  confidence?: number;       // Default: 0.90 for regex matches
}
```

---

## 3. Built-in Triggers

### 3.1 Image Generation

**Tool:** `generate_image`
**Confidence:** 0.95 (hard keyword) / 0.90 (regex)
**Arguments:** `{ prompt: string }`

**Keyword patterns:**
- "generate an image"
- "create an image"
- "draw a"
- "make a picture"
- "paint a"

**Regex patterns:**
- `(generate|create|make|draw|paint|show)\s+(an?\s+)?(image|picture|photo|illustration|drawing|portrait)\s+(of\s+)?`

**Extractor:** Returns the full original message as the prompt.

### 3.2 Web Search

**Tool:** `web_search`
**Confidence:** 0.95 (hard keyword) / 0.90 (regex)
**Arguments:** `{ query: string }`

**Keyword patterns:**
- "search the web"
- "google"
- "news about"

**Regex patterns:**
- `search\s+(the\s+)?web\s+(for\s+)?`
- `what\s+is\s+the\s+(latest|current|most\s+recent)`
- `(find|look\s+up|search)\s+(for\s+)?(news|headlines|recent)`
- `(latest|current|recent)\s+`

**Extractor:** Strips filler words ("for", "about", "the", "please", "can you", "I need"), extracts the search query from the remainder.

### 3.3 Memory Search

**Tool:** `search_memory`
**Confidence:** 0.95 (hard keyword) / 0.90 (regex)
**Arguments:** `{ query: string }`

**Keyword patterns:**
- "search memory"
- "recall from memory"
- "remember that"
- "store in memory"
- "save to memory"

**Regex patterns:**
- `search\s+(your\s+)?memory\s+(for\s+)?`
- `recall\s+(from\s+memory\s+)?`
- `(remember|store|save)\s+(that\s+|this\s+to\s+)?(in\s+|to\s+)?(memory\s+)?`

**Extractor:** Returns the full message (for "remember that X") or the query after the trigger phrase.

### 3.4 Document Vault — List

**Tool:** `list_documents`
**Confidence:** 0.95 (hard keyword) / 0.90 (regex)
**Arguments:** `{}`

**Keyword patterns:**
- "list files"
- "list documents"
- "show me the vault"

**Regex patterns:**
- `(list|show|display)\s+(all\s+)?(files|documents|vault)`

**Extractor:** No arguments needed.

### 3.5 Document Vault — Read

**Tool:** `read_document`
**Confidence:** 0.90 (regex only)
**Arguments:** `{ name: string }`

**Regex patterns:**
- `(read|open|show\s+me)\s+(file|document)\s+`

**Extractor:** Extracts the document name/ID after the trigger phrase.

---

## 4. Extractor Functions

Extractors parse arguments from the user's message after a trigger is detected.

### 4.1 `takeRest(text, startIndex)`

Helper function used by all extractors.

1. Takes the remainder of the text after the matched pattern
2. Strips polite fillers: "please", "can you", "could you", "I need", "I want", "help me"
3. Trims whitespace
4. Returns the cleaned remainder

### 4.2 `extractImageQuery(text)`

- Returns the full original message as the prompt
- No stripping — image generation benefits from full context

### 4.3 `extractWebQuery(text, startIndex)`

1. Calls `takeRest()` on the remainder
2. Strips additional web-specific fillers: "for", "about", "the", "on", "regarding"
3. Returns the cleaned query

### 4.4 `extractDocumentName(text, startIndex)`

1. Calls `takeRest()` on the remainder
2. Extracts the first token as the document name
3. Strips file extensions if present (optional)

---

## 5. Confidence Scoring

| Source | Default Confidence | Notes |
|--------|-------------------|-------|
| Hard keyword match | 0.95 | Exact substring found in user message |
| Regex pattern match | 0.90 | Pattern matched in user message |
| Model `tool_calls` | 1.0 | Model explicitly generated a function call |

**Threshold:** Implementations should use a minimum confidence threshold of 0.80 to avoid false positives from ambiguous phrasing.

---

## 6. Integration Points

### 6.1 Round 0 Fallback

When the model returns text without `tool_calls` on the first round, UTC checks the user's message for trigger patterns. If found, the tool is executed and the result is fed back to the model for synthesis.

### 6.2 LLM Failure Fallback

When the LLM call itself fails (timeout, connection error, rate limit), UTC checks the user's message for trigger patterns. If found, the tool is executed directly and the raw output is returned.

### 6.3 Parallel Tool Execution

When the model generates multiple `tool_calls`, they are executed concurrently using `Promise.allSettled()`. Partial failures are tolerated — successful results are returned even if some tools fail.

---

## 7. Local Model Optimization

For local/quantized models with limited context windows, UTC provides a reduced tool schema set:

| Constraint | Default | Reason |
|------------|---------|--------|
| Max tools in schema | 10 | Context budget for 16K token models |
| Schema verbosity | Minimal | Reduce token consumption |
| Description style | Example-driven | Include usage examples in descriptions |

### Schema Format

```typescript
{
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web. Use when user asks about current events, facts, or anything not in local knowledge. Args: query (required).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query. Example: "Python 3.14 release notes"' },
      },
      required: ['query'],
    },
  },
}
```

---

## 8. Configuration

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `MAX_TOOL_ROUNDS` | 5 | 1-10 | Maximum tool call rounds before forced synthesis |
| `TOOL_RESULT_MAX_CHARS` | 8000 | 1000-32000 | Max characters per tool result sent to model |
| `SYNTHESIS_MAX_CHARS` | 4000 | 1000-16000 | Max characters of tool result injected for synthesis |
| `LOCAL_TOOL_COUNT` | 10 | 1-20 | Max tools in local schema set |
| `LOCAL_CONTEXT_BUDGET` | 16384 | 4096-128000 | Total context window for local models |
| `KEYWORD_CONFIDENCE` | 0.95 | 0.80-1.0 | Confidence for hard keyword matches |
| `REGEX_CONFIDENCE` | 0.90 | 0.80-1.0 | Confidence for regex matches |
| `MIN_CONFIDENCE_THRESHOLD` | 0.80 | 0.50-1.0 | Minimum confidence to execute a tool |

---

## 9. Extending UTC

### Adding a New Tool

1. Add a trigger entry to the `TRIGGERS` array with patterns and an extractor
2. Place it in the correct priority position
3. Add a hard keyword override for the most common phrasing
4. Optionally add a local tool schema for small model support

### Testing

All trigger patterns are case-insensitive regex. Test edge cases:
- Polite phrasing: "please save this", "can you search"
- Ambiguous phrasing: "I need help with X"
- Missing context: "search for" (no query)
- Overlapping triggers: "draw a picture of search results"
