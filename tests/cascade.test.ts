import { describe, it, expect, vi } from 'vitest';
import { runCascade } from '../src/index.js';

describe('runCascade', () => {
  it('returns model tool_calls when present', async () => {
    const result = await runCascade({
      userMessage: 'hello',
      modelResponse: {
        content: null,
        tool_calls: [
          { function: { name: 'web_search', arguments: '{"query":"test"}' } },
        ],
      },
    });

    expect(result.triggered).toBe(true);
    expect(result.toolCall!.tool).toBe('web_search');
    expect(result.toolCall!.confidence).toBe(1.0);
    expect(result.toolCall!.source).toBe('model');
  });

  it('detects trigger from user message when model has no tool_calls', async () => {
    const result = await runCascade({
      userMessage: 'search the web for latest AI news',
      modelResponse: { content: "I'll search for that." },
    });

    expect(result.triggered).toBe(true);
    expect(result.toolCall!.tool).toBe('web_search');
    expect(result.toolCall!.source).toBe('keyword');
  });

  it('returns no-trigger result when nothing matches', async () => {
    const result = await runCascade({
      userMessage: 'hello, how are you?',
      modelResponse: { content: "I'm doing well!" },
    });

    expect(result.triggered).toBe(false);
    expect(result.rawText).toBe("I'm doing well!");
  });

  it('calls executeTool when provided', async () => {
    const executeTool = vi.fn().mockResolvedValue('result');

    await runCascade({
      userMessage: 'search the web for Python',
      modelResponse: { content: null },
      executeTool,
    });

    expect(executeTool).toHaveBeenCalledWith('web_search', { query: 'Python' });
  });

  it('handles malformed tool_calls arguments', async () => {
    const result = await runCascade({
      userMessage: 'hello',
      modelResponse: {
        content: null,
        tool_calls: [
          { function: { name: 'web_search', arguments: 'not json' } },
        ],
      },
    });

    expect(result.triggered).toBe(true);
    expect(result.toolCall!.args).toEqual({ raw: 'not json' });
  });
});
