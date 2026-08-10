# Contributing to ITC

Contributions are welcome. Please follow these guidelines.

## Adding a New Trigger

1. Add the trigger entry to `src/detector.ts` in the `TRIGGERS` array
2. Follow the existing entry format: `tool`, `patterns`, `extract`, `confidence`
3. Place it in the correct priority position (see SPECIFICATION.md §3)
4. Add at least one hard keyword override for the most common phrasing
5. Write tests in `tests/detector.test.ts` covering:
   - Basic trigger detection
   - Edge cases (polite phrasing, missing context, overlapping triggers)
   - Argument extraction correctness

## Adding a New Extractor

1. Add the extractor function to `src/extractors.ts`
2. Export it from `src/index.ts`
3. Write tests in `tests/extractors.test.ts`

## Running Tests

```bash
npm install
npm test
```

## Code Style

- TypeScript strict mode
- No external runtime dependencies (dev dependencies only)
- Case-insensitive regex patterns
- All patterns must be tested with both match and non-match cases
