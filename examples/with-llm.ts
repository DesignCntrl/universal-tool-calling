import { runCascade } from '../src/index.js';

async function executeTool(tool: string, args: Record<string, unknown>): Promise<string> {
  console.log(`[EXEC] ${tool}`, JSON.stringify(args));

  switch (tool) {
    case 'web_search':
      return `Search results for "${args.query}": 10 results found.`;
    case 'generate_image':
      return `Image generated: ${args.prompt}`;
    case 'search_memory':
      return `Memory results for "${args.query}": 3 matches found.`;
    case 'list_documents':
      return 'Documents: readme.md, api-spec, meeting-notes';
    case 'read_document':
      return `Contents of ${args.name}: ...`;
    default:
      return `Unknown tool: ${tool}`;
  }
}

async function handleUserMessage(userMessage: string) {
  console.log(`\nUser: ${userMessage}`);

  const modelResponse = {
    content: `I'll help you with that.`,
    tool_calls: null,
  };

  const result = await runCascade({
    userMessage,
    modelResponse,
    executeTool,
  });

  if (result.triggered) {
    console.log(`[CASCADE] Detected: ${result.toolCall!.tool} (${result.toolCall!.source}, ${result.toolCall!.confidence})`);
  } else {
    console.log(`[CASCADE] No trigger — returning text: "${result.rawText}"`);
  }
}

async function main() {
  await handleUserMessage('search the web for latest AI news');
  await handleUserMessage('generate an image of a mountain landscape');
  await handleUserMessage('what did we discuss about project X');
  await handleUserMessage('list files');
  await handleUserMessage('hello, how are you?');
}

main().catch(console.error);
