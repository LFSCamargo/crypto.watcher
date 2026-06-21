# o1-check

Production complexity and performance risk checker for TypeScript/JavaScript projects.

`o1-check` scans source files with [ts-morph](https://ts-morph.com/) and flags patterns that
are often too expensive for production: nested loops, DB calls in loops, unbounded queries,
sequential awaits, and more.

## Install

From the monorepo root:

```bash
pnpm install
pnpm --filter o1-check build
```

## Usage

```bash
# Scan a directory (defaults to src/)
o1-check src/

# JSON output
o1-check src/ --format json

# Fail CI when score drops below 70
o1-check src/ --fail-below 70

# Custom config
o1-check src/ --config o1-check.config.json
```

From the repo root:

```bash
pnpm run o1-check -- apps/api/src
```

### Exit codes

- `0` — no critical findings and score meets `--fail-below` (if set)
- `1` — any **critical** finding, score below `--fail-below`, or CLI/config error

## Example output

```txt
O1 Check Report

Score: 64/100
Risk: Medium

Findings:
1. High - DB query inside loop
   File: src/services/projects.ts:42
   Complexity: O(n) DB calls
   Recommendation: Batch query using WHERE IN or use a join.

2. Medium - Nested loop detected
   File: src/utils/matcher.ts:18
   Complexity: O(n²)
   Recommendation: Use a Map or Set to reduce lookup cost.
```

## Scoring

| Score | Risk |
|------:|------|
| 90–100 | Low |
| 70–89 | Acceptable |
| 50–69 | Medium |
| 30–49 | High |
| 0–29 | Critical |

Penalties per finding: low −3, medium −8, high −15, critical −25 (floor 0).

## Config

See `o1-check.config.example.json`:

```json
{
  "ignore": ["dist", "coverage"],
  "failBelow": 70,
  "rules": {
    "disabled": ["db.select-all"]
  }
}
```

Rule IDs use prefixes such as `code.`, `db.`, `async.`, and `api.`.

## What it checks

### Code complexity

- Cyclomatic complexity thresholds
- Function length and nesting depth
- Nested loops and recursive functions
- Long chained `.map()` / `.filter()` / `.reduce()` pipelines
- O(n²) `.includes()` / `.find()` inside nested loops

### Database / query risks

- SQL / ORM calls inside loops
- Unbounded `selectFrom` / `findMany` without `limit` / `take`
- `selectAll()` / `SELECT *`
- `LIKE '%term%'`
- Offset pagination
- In-memory `.filter()` after DB fetch (heuristic)
- Sequential DB awaits without `Promise.all`

### Async risks

- `await` inside loops
- `await` in `forEach` callbacks
- Unbounded `async` `.map()`
- Three or more sequential independent `await`s

## Good vs bad examples

### DB access

**Bad — O(n) queries**

```typescript
export async function getProjects(ids: string[]) {
  const results = []
  for (const id of ids) {
    results.push(await db.selectFrom('projects').where('id', '=', id).selectAll().executeTakeFirst())
  }
  return results
}
```

**Good — O(1) query**

```typescript
export async function getProjects(ids: string[]) {
  return db
    .selectFrom('projects')
    .where('id', 'in', ids)
    .select(['id', 'name', 'slug'])
    .limit(100)
    .execute()
}
```

### Nested loops

**Bad — O(n²)**

```typescript
export function matchPairs(groups: string[][], target: string) {
  for (const group of groups) {
    for (const item of group) {
      if (group.includes(target)) return item
    }
  }
  return null
}
```

**Good — O(n) with a Set**

```typescript
export function hasMatch(items: string[], target: string, lookup: Set<string>) {
  if (!lookup.has(target)) return false
  return items.some((item) => lookup.has(item))
}
```

### Async batching

**Bad — sequential awaits**

```typescript
export async function loadDashboard(userId: string) {
  const user = await db.selectFrom('users').where('id', '=', userId).executeTakeFirst()
  const projects = await db.selectFrom('projects').selectAll().execute()
  const votes = await db.selectFrom('votes').selectAll().execute()
  return { user, projects, votes }
}
```

**Good — parallel batch**

```typescript
export async function loadDashboard(userId: string) {
  const [user, projects, votes] = await Promise.all([
    db.selectFrom('users').where('id', '=', userId).select(['id', 'email']).executeTakeFirst(),
    db.selectFrom('projects').select(['id', 'name']).limit(50).execute(),
    db.selectFrom('votes').select(['id', 'project_id']).limit(50).execute(),
  ])
  return { user, projects, votes }
}
```

## Development

```bash
pnpm --filter o1-check test
pnpm --filter o1-check typecheck
pnpm --filter o1-check lint
pnpm --filter o1-check build
```

## Architecture

```
src/
  cli.ts
  scanner.ts
  scoring.ts
  types.ts
  analyzers/
    codeComplexity.ts
    databaseRisk.ts
    asyncRisk.ts
  reporters/
    textReporter.ts
    jsonReporter.ts
```

Heuristic by design — extend analyzers incrementally as false positives/negatives are found.

By default, `__tests__/` directories are skipped (production-path focus). Remove them from
`ignore` in config if you want test files scanned too.
