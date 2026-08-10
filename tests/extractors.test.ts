import { describe, it, expect } from 'vitest';
import { takeRest, extractWebQuery, extractDocumentName, extractMemoryQuery, extractImageQuery } from '../src/extractors.js';

describe('takeRest', () => {
  it('returns remainder after index', () => {
    expect(takeRest('hello world', 6)).toBe('world');
  });

  it('strips polite fillers', () => {
    expect(takeRest('please search for X', 0)).toBe('search for X');
  });

  it('strips "can you"', () => {
    expect(takeRest('can you help me', 0)).toBe('help me');
  });

  it('handles empty remainder', () => {
    expect(takeRest('hello', 5)).toBe('');
  });
});

describe('extractImageQuery', () => {
  it('returns full text as prompt', () => {
    const match = 'draw a puppy'.match(/(generate|create|make|draw|paint|show)/i)!;
    const result = extractImageQuery(match, 'draw a puppy');
    expect(result.prompt).toBe('draw a puppy');
  });
});

describe('extractWebQuery', () => {
  it('extracts query after trigger', () => {
    const match = 'search the web for latest AI news'.match(/search\s+(the\s+)?web\s+(for\s+)?/i)!;
    const result = extractWebQuery(match, 'search the web for latest AI news');
    expect(result.query).toBe('latest AI news');
  });

  it('strips filler words', () => {
    const match = 'search the web for the latest news about Python'.match(/search\s+(the\s+)?web\s+(for\s+)?/i)!;
    const result = extractWebQuery(match, 'search the web for the latest news about Python');
    expect(result.query).toContain('Python');
  });
});

describe('extractDocumentName', () => {
  it('extracts name after "read file"', () => {
    const match = 'read file project-notes'.match(/(read|open|show\s+me)\s+(file|document)\s+/i)!;
    const result = extractDocumentName(match, 'read file project-notes');
    expect(result.name).toBe('project-notes');
  });

  it('extracts name after "open document"', () => {
    const match = 'open document api-spec'.match(/(read|open|show\s+me)\s+(file|document)\s+/i)!;
    const result = extractDocumentName(match, 'open document api-spec');
    expect(result.name).toBe('api-spec');
  });
});

describe('extractMemoryQuery', () => {
  it('extracts query after "search memory for"', () => {
    const match = 'search memory for project alpha'.match(/search\s+(your\s+)?memory\s+(for\s+)?/i)!;
    const result = extractMemoryQuery(match, 'search memory for project alpha');
    expect(result.query).toBe('project alpha');
  });

  it('returns full text for "remember that X"', () => {
    const match = 'remember that my favorite color is teal'.match(/(remember|store|save)\s+(that\s+|this\s+to\s+)?(in\s+|to\s+)?(memory\s+)?/i)!;
    const result = extractMemoryQuery(match, 'remember that my favorite color is teal');
    expect(result.query).toContain('favorite color is teal');
  });
});
