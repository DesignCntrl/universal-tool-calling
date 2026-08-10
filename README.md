# UTC — Universal Tool Calling

**The specification that makes tools work even when models can't generate function calls.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.4+-3178c6.svg)](https://www.typescriptlang.org/)
[![Specification](https://img.shields.io/badge/spec-v1.0-green.svg)](SPECIFICATION.md)

---

## The Problem

Traditional tool calling requires models to generate structured JSON:

```json
{
  "tool_calls": [{
    "function": {
      "name": "web_search",
      "arguments": "{\"query\": \"latest AI news\"}"
    }
  }]
}
```

Large models (GPT-4, Claude, Qwen-32B) handle this fine. But smaller models — 1B-8B parameter, quantized, local — often fail. They might say "let me search for that" without ever emitting a function call, get overwhelmed by JSON schemas consuming thousands of tokens of context, or simply not understand the protocol.

**UTC solves this by letting the infrastructure do the detection, not the model.**

## Architecture: The 3-Layer Cascade

```
User message: "search the web for latest AI news"
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Layer 0: Model tries first   │
        │  (function-calling format)    │
        └───────────┬───────────────────┘
                    │
           ┌────────┴────────┐
           │ Model generates  │
           │ tool_calls JSON? │
           └────────┬────────┘
              YES   │   NO
              │     │
              ▼     ▼
        ┌─────┐  ┌───────────────────────────────┐
        │ RUN │  │  Layer 1: Hard keyword check   │
        │ IT  │  │  "search the web" → web_search │
        └─────┘  └───────────┬───────────────────┘
                             │
                    ┌────────┴────────┐
                    │ Keyword match?  │
                    └────────┬────────┘
                       YES   │   NO
                       │     │
                       ▼     ▼
                    ┌────┐  ┌───────────────────────────────┐
                    │RUN │  │  Layer 2: Regex pattern match  │
                    │ IT │  │  "search\s+(the\s+)?web\s+for" │
                    └────┘  └───────────┬───────────────────┘
                                       │
                              ┌────────┴────────┐
                              │ Pattern match?  │
                              └────────┬────────┘
                                 YES   │   NO
                                 │     │
                                 ▼     ▼
                              ┌────┐  ┌─────────────────────┐
                              │RUN │  │  Return text as-is   │
                              │ IT │  │  (final answer)      │
                              └────┘  └─────────────────────┘
```

**Key insight:** Layers 1-2 check the **user's message**, not the model's response. If someone types "search the web for X", we don't need the model to generate a function call — the infrastructure detects the intent directly.

## Quick Start

```typescript
import { detectNaturalTrigger } from 'utc-spec';

const result = detectNaturalTrigger('search the web for latest AI news');

if (result) {
  console.log(result.tool);   // "web_search"
  console.log(result.args);   // { query: "latest AI news" }
  console.log(result.confidence); // 0.95
  console.log(result.source); // "keyword"
}
```

## Supported Tools

| Tool | Trigger Examples | Confidence |
|------|-----------------|------------|
| `generate_image` | "draw a puppy", "create an image of sunset" | 0.95 |
| `web_search` | "search the web for X", "google Y", "news about Z" | 0.95 |
| `search_memory` | "search memory for X", "remember that Y" | 0.95 |
| `list_documents` | "list files", "show me the vault" | 0.95 |
| `read_document` | "read file README.md", "open document api-spec" | 0.90 |

## How It Compares

| Feature | Native Function Calling | UTC |
|---------|------------------------|-----|
| Requires model support | Yes | No |
| Works with small models | Sometimes | Always |
| Context token cost | 2000-4000 tokens for schemas | 0 (pattern-based) |
| Detection latency | Model inference time | <1ms |
| False positive rate | 0% (model decides) | ~5% (configurable) |
| Parallel tool execution | Depends on model | Yes (`Promise.allSettled`) |
| LLM failure fallback | No | Yes |

## Installation

```bash
npm install utc-spec
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
