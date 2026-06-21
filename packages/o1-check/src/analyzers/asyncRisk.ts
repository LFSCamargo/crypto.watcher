import { Node, SourceFile, SyntaxKind } from 'ts-morph'
import type { Finding } from '../types.js'
import {
  createFinding,
  getEnclosingLoops,
  getPropertyNameFromCall,
  isAwaitExpressionInsideLoop,
  relativePath,
} from './helpers.js'

export function analyzeAsyncRisk(sourceFile: SourceFile): Finding[] {
  const filePath = relativePath(sourceFile)
  const findings: Finding[] = []

  findings.push(...detectAwaitInLoops(sourceFile, filePath))
  findings.push(...detectAsyncForEach(sourceFile, filePath))
  findings.push(...detectAsyncMap(sourceFile, filePath))
  findings.push(...detectSequentialAwaits(sourceFile, filePath))

  return findings
}

function detectAwaitInLoops(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const awaitExpr of sourceFile.getDescendantsOfKind(SyntaxKind.AwaitExpression)) {
    if (!isAwaitExpressionInsideLoop(awaitExpr)) {
      continue
    }

    const text = awaitExpr.getText()
    const isDb = text.includes('query') || text.includes('selectFrom') || text.includes('fetch(')

    findings.push(
      createFinding({
        id: 'async.await-in-loop',
        title: 'Async call inside loop',
        severity: isDb ? 'critical' : 'high',
        category: 'async',
        complexity: 'O(n)',
        recommendation: 'Batch work with Promise.all or move I/O outside the loop.',
        node: awaitExpr,
        filePath,
      }),
    )
  }

  return findings
}

function detectAsyncForEach(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (getPropertyNameFromCall(call) !== 'forEach') {
      continue
    }

    const callback = call.getArguments()[0]
    if (!callback || !Node.isArrowFunction(callback)) {
      continue
    }

    const hasAwait = callback.getDescendantsOfKind(SyntaxKind.AwaitExpression).length > 0
    if (!hasAwait) {
      continue
    }

    findings.push(
      createFinding({
        id: 'async.forEach-await',
        title: 'await inside forEach callback',
        severity: 'high',
        category: 'async',
        complexity: 'O(n)',
        recommendation: 'Use for...of with await sequentially, or Promise.all with map for parallel batching.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectAsyncMap(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (getPropertyNameFromCall(call) !== 'map') {
      continue
    }

    const callback = call.getArguments()[0]
    if (!callback || !Node.isArrowFunction(callback)) {
      continue
    }

    const isAsync = callback.isAsync()
    if (!isAsync) {
      continue
    }

    const loops = getEnclosingLoops(call)
    if (loops.length > 0) {
      continue
    }

    findings.push(
      createFinding({
        id: 'async.async-map',
        title: 'Async map creates many concurrent promises',
        severity: 'medium',
        category: 'async',
        complexity: 'O(n)',
        recommendation: 'Batch with Promise.all and concurrency limits, or process in chunks.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function detectSequentialAwaits(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of sourceFile.getFunctions()) {
    const awaits = fn.getDescendantsOfKind(SyntaxKind.AwaitExpression)
    if (awaits.length < 3) {
      continue
    }

    if (fn.getText().includes('Promise.all')) {
      continue
    }

    const independent = awaits.filter((awaitExpr) => !isAwaitExpressionInsideLoop(awaitExpr))
    if (independent.length < 3) {
      continue
    }

    findings.push(
      createFinding({
        id: 'async.sequential-awaits',
        title: 'Multiple sequential awaits that may be batchable',
        severity: 'medium',
        category: 'async',
        complexity: 'O(n)',
        recommendation: 'Use Promise.all when operations are independent.',
        node: independent[2]!,
        filePath,
      }),
    )
  }

  return findings
}
