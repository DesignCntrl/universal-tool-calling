import type { CascadeOptions, CascadeResult, ToolCall } from './types.js';
import { detectNaturalTrigger } from './detector.js';

export async function runCascade(options: CascadeOptions): Promise<CascadeResult> {
  const { userMessage, modelResponse, executeTool } = options;

  if (modelResponse.tool_calls && modelResponse.tool_calls.length > 0) {
    const tc = modelResponse.tool_calls[0];
    const toolCall: ToolCall = {
      tool: tc.function.name,
      args: safeJsonParse(tc.function.arguments),
      confidence: 1.0,
      source: 'model',
    };

    if (executeTool) {
      await executeTool(toolCall.tool, toolCall.args);
    }

    return { triggered: true, toolCall, rawText: modelResponse.content || '' };
  }

  const trigger = detectNaturalTrigger(userMessage);
  if (trigger) {
    if (executeTool) {
      await executeTool(trigger.tool, trigger.args);
    }
    return { triggered: true, toolCall: trigger, rawText: modelResponse.content || '' };
  }

  return { triggered: false, rawText: modelResponse.content || userMessage };
}

function safeJsonParse(str: string): Record<string, unknown> {
  try {
    return JSON.parse(str);
  } catch {
    return { raw: str };
  }
}
