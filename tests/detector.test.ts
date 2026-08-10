import { describe, it, expect } from 'vitest';
import { detectNaturalTrigger, TRIGGERS, HARD_KEYWORDS } from '../src/index.js';

describe('detectNaturalTrigger', () => {
  describe('image generation', () => {
    it('detects "generate an image of X"', () => {
      const result = detectNaturalTrigger('generate an image of a cyberpunk city');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
      expect(result!.args.prompt).toBe('generate an image of a cyberpunk city');
      expect(result!.source).toBe('keyword');
    });

    it('detects "draw a puppy"', () => {
      const result = detectNaturalTrigger('draw a puppy playing in the park');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
      expect(result!.args.prompt).toBe('draw a puppy playing in the park');
    });

    it('detects "create an image"', () => {
      const result = detectNaturalTrigger('create an image of a sunset');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
    });

    it('detects regex: "make a picture of"', () => {
      const result = detectNaturalTrigger('make a picture of a medieval castle');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
    });

    it('detects regex: "paint a portrait of"', () => {
      const result = detectNaturalTrigger('paint a portrait of a cat');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
    });
  });

  describe('web search', () => {
    it('detects "search the web for X"', () => {
      const result = detectNaturalTrigger('search the web for latest AI news');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('web_search');
      expect(result!.args.query).toBe('latest AI news');
    });

    it('detects "google X"', () => {
      const result = detectNaturalTrigger('google best practices for REST API design');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('web_search');
    });

    it('detects "what is the current X"', () => {
      const result = detectNaturalTrigger('what is the current bitcoin price');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('web_search');
    });

    it('strips filler words from query', () => {
      const result = detectNaturalTrigger('can you please search the web for Python 3.14 release notes');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('web_search');
      expect(result!.args.query).toContain('Python 3.14');
    });
  });

  describe('memory search', () => {
    it('detects "search memory for X"', () => {
      const result = detectNaturalTrigger('search memory for project alpha');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('search_memory');
    });

    it('detects "recall from memory X"', () => {
      const result = detectNaturalTrigger('recall from memory our conversation about ML');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('search_memory');
    });

    it('detects "remember that X"', () => {
      const result = detectNaturalTrigger('remember that my favorite color is teal');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('search_memory');
    });
  });

  describe('document vault', () => {
    it('detects "list files"', () => {
      const result = detectNaturalTrigger('list files');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('list_documents');
    });

    it('detects "show me the vault"', () => {
      const result = detectNaturalTrigger('show me the vault');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('list_documents');
    });

    it('detects "read file X"', () => {
      const result = detectNaturalTrigger('read file project-notes');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('read_document');
      expect(result!.args.name).toBe('project-notes');
    });

    it('detects "open document X"', () => {
      const result = detectNaturalTrigger('open document api-spec');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('read_document');
      expect(result!.args.name).toBe('api-spec');
    });
  });

  describe('no trigger', () => {
    it('returns null for empty string', () => {
      expect(detectNaturalTrigger('')).toBeNull();
    });

    it('returns null for greeting', () => {
      expect(detectNaturalTrigger('hello, how are you?')).toBeNull();
    });

    it('returns null for generic question', () => {
      expect(detectNaturalTrigger('what is machine learning?')).toBeNull();
    });
  });

  describe('case insensitivity', () => {
    it('detects uppercase trigger', () => {
      const result = detectNaturalTrigger('SEARCH THE WEB FOR PYTHON');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('web_search');
    });

    it('detects mixed case trigger', () => {
      const result = detectNaturalTrigger('List Files');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('list_documents');
    });
  });

  describe('priority order', () => {
    it('image trigger takes priority over web search', () => {
      const result = detectNaturalTrigger('draw a picture of search results');
      expect(result).not.toBeNull();
      expect(result!.tool).toBe('generate_image');
    });
  });
});
