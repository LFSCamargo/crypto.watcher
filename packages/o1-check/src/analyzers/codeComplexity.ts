import {
  CallExpression,
  Node,
  SourceFile,
  SyntaxKind,
} from 'ts-morph'
import type { Finding } from '../types.js'
import {
  collectLoops,
  countDecisionPoints,
  createFinding,
  functionLineSpan,
  getCallChainLength,
  getFunctionLikeNodes,
  getFunctionName,
  getPropertyNameFromCall,
  isArrayMethod,
  isNestedLoop,
  loopContainsNestedLoop,
  maxNestingDepth,
  relativePath,
} from './helpers.js'

export function analyzeCodeComplexity(sourceFile: SourceFile): Finding[] {
  const filePath = relativePath(sourceFile)
  const findings: Finding[] = []

  findings.push(...detectHighCyclomaticComplexity(sourceFile, filePath))
  findings.push(...detectLongFunctions(sourceFile, filePath))
  findings.push(...detectDeepNesting(sourceFile, filePath))
  findings.push(...detectNestedLoops(sourceFile, filePath))
  findings.push(...detectRecursiveFunctions(sourceFile, filePath))
  findings.push(...detectChainedArrayOperations(sourceFile, filePath))
  findings.push(...detectQuadraticLookupPatterns(sourceFile, filePath))

  return findings
}

function detectHighCyclomaticComplexity(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of getFunctionLikeNodes(sourceFile)) {
    const complexity = countDecisionPoints(fn)
    const name = getFunctionName(fn) ?? 'anonymous function'

    if (complexity >= 20) {
      findings.push(
        createFinding({
          id: 'code.cyclomatic-complexity.critical',
          title: `Very high cyclomatic complexity in ${name}`,
          severity: 'critical',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Split the function into smaller units and reduce branching.',
          node: fn,
          filePath,
        }),
      )
    } else if (complexity >= 12) {
      findings.push(
        createFinding({
          id: 'code.cyclomatic-complexity.high',
          title: `High cyclomatic complexity in ${name}`,
          severity: 'high',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Extract helpers and simplify conditional paths.',
          node: fn,
          filePath,
        }),
      )
    } else if (complexity >= 8) {
      findings.push(
        createFinding({
          id: 'code.cyclomatic-complexity.medium',
          title: `Elevated cyclomatic complexity in ${name}`,
          severity: 'medium',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Consider refactoring to reduce decision points.',
          node: fn,
          filePath,
        }),
      )
    }
  }

  return findings
}

function detectLongFunctions(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of getFunctionLikeNodes(sourceFile)) {
    const lines = functionLineSpan(fn)
    const name = getFunctionName(fn) ?? 'anonymous function'

    if (lines >= 120) {
      findings.push(
        createFinding({
          id: 'code.function-length.critical',
          title: `Function ${name} is very long (${lines} lines)`,
          severity: 'high',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Break the function into smaller, testable pieces.',
          node: fn,
          filePath,
        }),
      )
    } else if (lines >= 60) {
      findings.push(
        createFinding({
          id: 'code.function-length.medium',
          title: `Function ${name} exceeds recommended length (${lines} lines)`,
          severity: 'medium',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Extract cohesive blocks into named helpers.',
          node: fn,
          filePath,
        }),
      )
    }
  }

  return findings
}

function detectDeepNesting(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of getFunctionLikeNodes(sourceFile)) {
    const depth = maxNestingDepth(fn)
    const name = getFunctionName(fn) ?? 'anonymous function'

    if (depth >= 6) {
      findings.push(
        createFinding({
          id: 'code.nesting-depth.high',
          title: `Deep nesting in ${name} (depth ${depth})`,
          severity: 'high',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Use early returns or extract nested logic into helpers.',
          node: fn,
          filePath,
        }),
      )
    } else if (depth >= 4) {
      findings.push(
        createFinding({
          id: 'code.nesting-depth.medium',
          title: `Nested control flow in ${name} (depth ${depth})`,
          severity: 'medium',
          category: 'code',
          complexity: 'unknown',
          recommendation: 'Flatten nesting with guard clauses where possible.',
          node: fn,
          filePath,
        }),
      )
    }
  }

  return findings
}

function detectNestedLoops(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const loop of collectLoops(sourceFile)) {
    if (!isNestedLoop(loop) && !loopContainsNestedLoop(loop)) {
      continue
    }

    findings.push(
      createFinding({
        id: 'code.nested-loop',
        title: 'Nested loop detected',
        severity: isNestedLoop(loop) ? 'high' : 'medium',
        category: 'code',
        complexity: 'O(n²)',
        recommendation: 'Use a Map or Set to reduce lookup cost when matching items across collections.',
        node: loop,
        filePath,
      }),
    )
  }

  return findings
}

function detectRecursiveFunctions(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const fn of getFunctionLikeNodes(sourceFile)) {
    const name = getFunctionName(fn)
    if (!name) {
      continue
    }

    const selfCalls = fn
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === name)

    if (selfCalls.length === 0) {
      continue
    }

    findings.push(
      createFinding({
        id: 'code.recursive-function',
        title: `Recursive function ${name} detected`,
        severity: 'medium',
        category: 'code',
        complexity: 'unknown',
        recommendation: 'Ensure recursion is bounded or replace with an iterative approach for large inputs.',
        node: fn,
        filePath,
      }),
    )
  }

  return findings
}

function detectChainedArrayOperations(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const chainLength = getCallChainLength(call)
    if (chainLength < 3) {
      continue
    }

    const methodName = getOutermostArrayMethod(call)
    if (!methodName) {
      continue
    }

    findings.push(
      createFinding({
        id: 'code.chained-array-ops',
        title: `Large chained array operation (${chainLength} steps)`,
        severity: chainLength >= 4 ? 'medium' : 'low',
        category: 'memory',
        complexity: 'O(n)',
        recommendation: 'Combine passes into a single loop or reduce intermediate allocations.',
        node: call,
        filePath,
      }),
    )
  }

  return findings
}

function getOutermostArrayMethod(call: CallExpression): string | null {
  let expression = call.getExpression()

  while (Node.isPropertyAccessExpression(expression)) {
    const name = expression.getName()
    if (isArrayMethod(name)) {
      return name
    }

    const parentExpression = expression.getExpression()
    if (Node.isCallExpression(parentExpression)) {
      expression = parentExpression.getExpression()
      continue
    }

    break
  }

  return null
}

function detectQuadraticLookupPatterns(sourceFile: SourceFile, filePath: string): Finding[] {
  const findings: Finding[] = []

  for (const loop of collectLoops(sourceFile)) {
    if (!isNestedLoop(loop)) {
      continue
    }

    const innerCalls = loop
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => {
        if (!Node.isPropertyAccessExpression(call.getExpression())) {
          return false
        }

        const method = getPropertyNameFromCall(call)
        if (!method) {
          return false
        }

        return ['includes', 'indexOf', 'find', 'findIndex', 'some'].includes(method)
      })

    if (innerCalls.length === 0) {
      continue
    }

    findings.push(
      createFinding({
        id: 'code.quadratic-lookup',
        title: 'O(n²) lookup pattern in nested loop',
        severity: 'high',
        category: 'code',
        complexity: 'O(n²)',
        recommendation: 'Pre-index data with a Map or Set before iterating.',
        node: innerCalls[0]!,
        filePath,
      }),
    )
  }

  return findings
}
