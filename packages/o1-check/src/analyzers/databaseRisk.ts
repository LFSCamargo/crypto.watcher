import { Node, SourceFile, SyntaxKind } from 'ts-morph'
import type { Finding } from '../types.js'
import { createFinding, getFluentChainText, getPropertyNameFromCall, isInsideLoop, relativePath } from './helpers.js'

const DB_CALL_PATTERNS = [
  'selectFrom',
  'insertInto',
  'updateTable',
  'deleteFrom',
  'executeQuery',
  'execute',
  'query(',
  'prisma.',
  '$queryRaw',
  '$executeRaw',
  'knex(',
  'db.raw',
]

const SQL_STRING_PATTERNS = ['select ', 'insert ', 'update ', 'delete ', 'from ']

export function analyzeDatabaseRisk(sourceFile: SourceFile): Finding[] {
  const filePath = relativePath(sourceFile)
  const findings: Finding[] = []

  findings.push(...detectDbCallsInLoops(sourceFile, filePath))
  findings.push(...detectSqlInLoops(sourceFile, filePath))
  findings.push(...detectUnboundedQueries(sourceFile, filePath))
  findings.push(...detectSelectAll(sourceFile, filePath))
  findings.push(...detectLikeWildcard(sourceFile, filePath))
  findings.push(...detectOffsetPagination(sourceFile, filePath))
  findings.push(...detectInMemoryFiltering(sourceFile, filePath))
  findings.push(...detectSequentialDbCalls(sourceFile, filePath))
  findings.push(...detectListEndpointWithoutLimit(sourceFile, filePath))

  return findings
}

function detectDbCallsInLoops(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (!isInsideLoop(call)) {
      continue
    }

    const text = call.getText()
    if (!DB_CALL_PATTERNS.some((pattern) => text.includes(pattern))) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.query-in-loop',
        title: 'DB query inside loop',
        severity: 'high',
        category: 'database',
        complexity: 'O(n) DB calls',
        recommendation: 'Batch query using WHERE IN or use a join.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectSqlInLoops(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const node of sourceFile.getDescendants()) {
    if (!isInsideLoop(node)) {
      continue
    }

    const text = node.getText().toLowerCase()
    const looksLikeSql = SQL_STRING_PATTERNS.some((pattern) => text.includes(pattern))
    const isTemplate = Node.isTemplateExpression(node) || Node.isNoSubstitutionTemplateLiteral(node)

    if (!looksLikeSql || !isTemplate) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.sql-in-loop',
        title: 'SQL string inside loop',
        severity: 'high',
        category: 'database',
        complexity: 'O(n) DB calls',
        recommendation: 'Move SQL outside the loop and batch parameters.',
        node,
        filePath,
      }),
    )
  }

  return findings
}

function detectUnboundedQueries(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []
  const reported = new Set<string>()

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const method = getPropertyNameFromCall(call)
    if (method === 'executeTakeFirst' || method === 'executeTakeFirstOrThrow') {
      continue
    }

    if (method !== 'execute' && method !== 'findMany') {
      continue
    }

    const chainText = getFluentChainText(call)
    if (!chainText.includes('selectFrom') && !chainText.includes('findMany') && !chainText.includes('.select(')) {
      continue
    }

    if (chainText.includes('.limit(') || chainText.includes('.take(') || chainText.includes('take:')) {
      continue
    }

    const key = `${filePath}:${call.getStartLineNumber()}`
    if (reported.has(key)) {
      continue
    }
    reported.add(key)

    findings.push(
      createFinding({
        id: 'db.unbounded-query',
        title: 'Potentially unbounded database query',
        severity: 'medium',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Add limit/take and paginate list queries.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectSelectAll(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const method = getPropertyNameFromCall(call)
    if (method !== 'selectAll') {
      continue
    }

    const chainText = getFluentChainText(call)
    if (
      chainText.includes('executeTakeFirst') ||
      chainText.includes('executeTakeFirstOrThrow') ||
      chainText.includes('returningAll')
    ) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.select-all',
        title: 'SELECT * / selectAll() usage',
        severity: 'low',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Select only required columns to reduce I/O and memory.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectLikeWildcard(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const node of sourceFile.getDescendants()) {
    const text = node.getText()
    if (!text.includes("like '%") && !text.includes('like "%') && !text.includes("LIKE '%")) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.like-wildcard',
        title: "LIKE '%term%' pattern detected",
        severity: 'medium',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Leading wildcards prevent index use; prefer prefix search or full-text indexes.',
        node,
        filePath,
      }),
    )
  }

  return findings
}

function detectOffsetPagination(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (!call.getText().includes('.offset(')) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.offset-pagination',
        title: 'Offset pagination detected',
        severity: 'low',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Prefer cursor/keyset pagination for large datasets.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectInMemoryFiltering(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of sourceFile.getFunctions()) {
    const bodyText = fn.getBody()?.getText() ?? ''
    const hasDbRead =
      bodyText.includes('selectFrom') ||
      bodyText.includes('findMany') ||
      bodyText.includes('query(') ||
      bodyText.includes('await db')
    const hasArrayFilter = bodyText.includes('.filter(')

    if (!hasDbRead || !hasArrayFilter) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.in-memory-filter',
        title: 'Possible in-memory filtering after database fetch',
        severity: 'medium',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Push filters into the SQL WHERE clause when possible.',
        node: fn,
        filePath,
      }),
    )
  }

  return findings
}

function detectSequentialDbCalls(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of sourceFile.getFunctions()) {
    const awaits = fn.getDescendantsOfKind(SyntaxKind.AwaitExpression)
    const dbAwaits = awaits.filter((awaitExpr) => {
      const text = awaitExpr.getText()
      return DB_CALL_PATTERNS.some((pattern) => text.includes(pattern))
    })

    if (dbAwaits.length < 2) {
      continue
    }

    const hasPromiseAll = fn.getText().includes('Promise.all')
    if (hasPromiseAll) {
      continue
    }

    findings.push(
      createFinding({
        id: 'db.sequential-calls',
        title: 'Multiple sequential database calls',
        severity: 'medium',
        category: 'database',
        complexity: 'O(n)',
        recommendation: 'Batch with Promise.all or combine into a single joined query.',
        node: dbAwaits[1]!,
        filePath,
      }),
    )
  }

  return findings
}

function detectListEndpointWithoutLimit(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expressionText = call.getExpression().getText()
    if (!expressionText.endsWith('.get') && !expressionText.endsWith('.router.get')) {
      continue
    }

    const handler = call.getArguments()[0]
    if (!handler || !Node.isArrowFunction(handler)) {
      continue
    }

    const handlerText = handler.getText()
    const queriesDb = handlerText.includes('selectFrom') || handlerText.includes('findMany')
    const hasLimit = handlerText.includes('.limit(') || handlerText.includes('.take(')

    if (queriesDb && !hasLimit) {
      findings.push(
        createFinding({
          id: 'api.list-without-pagination',
          title: 'List endpoint may lack pagination',
          severity: 'high',
          category: 'api',
          complexity: 'O(n)',
          recommendation: 'Require page/limit params and enforce a maximum page size.',
          node: call,
          filePath,
        }),
      )
    }
  }

  return findings
}
