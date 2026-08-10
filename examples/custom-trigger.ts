import { TRIGGERS, detectNaturalTrigger } from '../src/index.js';
import type { Trigger } from '../src/index.js';

const customTrigger: Trigger = {
  tool: 'create_document',
  patterns: [
    'save\\s+(this\\s+)?(as\\s+a\\s+)?document',
    'create\\s+(a\\s+)?document',
    'persist\\s+(this\\s+)?to\\s+(the\\s+)?vault',
  ],
  extract: (_m, fullText) => {
    const rest = fullText.replace(_m[0], '').trim();
    const parts = rest.split(/\s+(?:called|named|as)\s+/i);
    return {
      name: parts[0]?.trim() || 'untitled',
      content: parts[1]?.trim() || rest,
    };
  },
};

TRIGGERS.push(customTrigger);

const tests = [
  'save this as a document called meeting-notes',
  'create a document with the API spec',
  'can you persist this to the vault?',
];

for (const input of tests) {
  const result = detectNaturalTrigger(input);
  if (result) {
    console.log(`"${input}"`);
    console.log(`  → tool: ${result.tool}`);
    console.log(`  → args: ${JSON.stringify(result.args)}`);
  } else {
    console.log(`"${input}" → no trigger`);
  }
  console.log();
}
