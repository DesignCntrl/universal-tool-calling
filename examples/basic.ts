import { detectNaturalTrigger } from '../src/index.js';

const tests = [
  'search the web for latest AI news',
  'generate an image of a cyberpunk city',
  'what is the current bitcoin price',
  'draw a golden retriever in a meadow',
  'search memory for project alpha',
  'list files',
  'read file project-notes',
  'remember that my favorite color is teal',
  'please search the web for Python 3.14 release notes',
  'google best practices for REST API design',
  'hello, how are you?',
];

for (const input of tests) {
  const result = detectNaturalTrigger(input);
  if (result) {
    console.log(`"${input}"`);
    console.log(`  → tool: ${result.tool}`);
    console.log(`  → args: ${JSON.stringify(result.args)}`);
    console.log(`  → confidence: ${result.confidence} (${result.source})`);
  } else {
    console.log(`"${input}"`);
    console.log(`  → no trigger detected`);
  }
  console.log();
}
