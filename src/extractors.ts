const FILLER_WORDS = /^(please|can you|could you|would you|i need|i want|help me|hey|hi)\s*/i;
const WEB_FILLERS = /\b(for|about|the|on|regarding|of)\s+/gi;

export function takeRest(text: string, startIndex: number): string {
  const rest = text.slice(startIndex);
  return rest.replace(FILLER_WORDS, '').trim();
}

export function extractImageQuery(_match: RegExpMatchArray, fullText: string): { prompt: string } {
  return { prompt: fullText };
}

export function extractWebQuery(_match: RegExpMatchArray, fullText: string): { query: string } {
  const raw = fullText.replace(_match[0], '').trim();
  const cleaned = raw
    .replace(FILLER_WORDS, '')
    .replace(WEB_FILLERS, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { query: cleaned || raw };
}

export function extractDocumentName(_match: RegExpMatchArray, fullText: string): { name: string } {
  const rest = takeRest(fullText, _match.index! + _match[0].length);
  const name = rest.split(/\s+/)[0]?.replace(/\.\w+$/, '') || 'untitled';
  return { name };
}

export function extractMemoryQuery(_match: RegExpMatchArray, fullText: string): { query: string } {
  const rest = takeRest(fullText, _match.index! + _match[0].length);
  return { query: rest || fullText };
}
