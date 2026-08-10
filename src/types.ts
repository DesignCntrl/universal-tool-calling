export interface Trigger {
  tool: string;
  patterns: string[];
  extract: (match: RegExpMatchArray, fullText: string) => Record<string, unknown>;
  confidence?: number;
}

export interface HardKeyword {
  keyword: string;
  tool: string;
  args: (text: string) => Record<string, unknown>;
  confidence?: number;
}

export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
  confidence: number;
  source: 'model' | 'keyword' | 'regex';
}

export interface CascadeResult {
  triggered: boolean;
  toolCall?: ToolCall;
  rawText: string;
}

export interface CascadeOptions {
  userMessage: string;
  modelResponse: {
    content?: string | null;
    tool_calls?: Array<{
      function: { name: string; arguments: string };
    }> | null;
  };
  executeTool?: (tool: string, args: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}
