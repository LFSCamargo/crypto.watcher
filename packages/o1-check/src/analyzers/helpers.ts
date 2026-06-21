import {
  ArrowFunction,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  MethodDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'ts-morph'
import type { Finding } from '../types.js'

type FunctionLike =
  | FunctionDeclaration
  | MethodDeclaration
  | FunctionExpression
  | ArrowFunction

export function relativePath(sourceFile: SourceFile): string {
  return sourceFile.getFilePath()
}

export function locationOf(node: Node): { line: number; column: number } {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const lineAndColumn = sourceFile.getLineAndColumnAtPos(start)
  return { line: lineAndColumn.line, column: lineAndColumn.column }
}

export function createFinding(
  partial: Omit<Finding, 'filePath' | 'line'> & { node: Node; filePath: string },
): Finding {
  const { node, ...rest } = partial
  const { line, column } = locationOf(node)
  return { ...rest, line, column }
}

export function getFunctionLikeNodes(sourceFile: SourceFile): FunctionLike[] {
  return [
    ...sourceFile.getFunctions(),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
  ] as FunctionLike[]
}

export function isLoopNode(node: Node): boolean {
  return (
    Node.isForStatement(node) ||
    Node.isForOfStatement(node) ||
    Node.isForInStatement(node) ||
    Node.isWhileStatement(node) ||
    Node.isDoStatement(node)
  )
}

export function getEnclosingLoops(node: Node): Node[] {
  const loops: Node[] = []
  let current: Node | undefined = node.getParent()

  while (current) {
    if (isLoopNode(current)) {
      loops.push(current)
    }
    current = current.getParent()
  }

  return loops
}

export function isInsideLoop(node: Node): boolean {
  return getEnclosingLoops(node).length > 0
}

export function countDecisionPoints(functionNode: FunctionLike): number {
  let count = 1

  for (const descendant of functionNode.getDescendants()) {
    const kind = descendant.getKind()
    if (
      kind === SyntaxKind.IfStatement ||
      kind === SyntaxKind.ForStatement ||
      kind === SyntaxKind.ForOfStatement ||
      kind === SyntaxKind.ForInStatement ||
      kind === SyntaxKind.WhileStatement ||
      kind === SyntaxKind.DoStatement ||
      kind === SyntaxKind.CatchClause ||
      kind === SyntaxKind.ConditionalExpression ||
      kind === SyntaxKind.CaseClause
    ) {
      count += 1
    }

    if (kind === SyntaxKind.BinaryExpression) {
      const operator = descendant.asKind(SyntaxKind.BinaryExpression)?.getOperatorToken().getKind()
      if (operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken) {
        count += 1
      }
    }
  }

  return count
}

export function maxNestingDepth(functionNode: FunctionLike): number {
  let maxDepth = 0

  function walk(node: Node, depth: number): void {
    maxDepth = Math.max(maxDepth, depth)

    for (const child of node.getChildren()) {
      if (isBlockLike(child)) {
        walk(child, depth + 1)
      } else {
        walk(child, depth)
      }
    }
  }

  const body = functionNode.getBody()
  if (body) {
    walk(body, 0)
  }

  return maxDepth
}

function isBlockLike(node: Node): boolean {
  const kind = node.getKind()
  return (
    kind === SyntaxKind.Block ||
    kind === SyntaxKind.IfStatement ||
    kind === SyntaxKind.ForStatement ||
    kind === SyntaxKind.ForOfStatement ||
    kind === SyntaxKind.ForInStatement ||
    kind === SyntaxKind.WhileStatement ||
    kind === SyntaxKind.DoStatement ||
    kind === SyntaxKind.TryStatement ||
    kind === SyntaxKind.SwitchStatement
  )
}

export function getFunctionName(functionNode: FunctionLike): string | undefined {
  if (Node.isFunctionDeclaration(functionNode) || Node.isMethodDeclaration(functionNode)) {
    return functionNode.getName()
  }

  const parent = functionNode.getParent()
  if (parent && Node.isVariableDeclaration(parent)) {
    return parent.getName()
  }

  return undefined
}

export function functionLineSpan(functionNode: FunctionLike): number {
  const start = functionNode.getStartLineNumber()
  const end = functionNode.getEndLineNumber()
  return Math.max(0, end - start + 1)
}

export function isArrayMethod(name: string): boolean {
  return ['map', 'filter', 'reduce', 'flatMap', 'forEach', 'find', 'some', 'every'].includes(name)
}

export function getCallChainLength(call: CallExpression): number {
  let length = 1
  let expression = call.getExpression()

  while (Node.isPropertyAccessExpression(expression)) {
    const name = expression.getName()
    if (!isArrayMethod(name)) {
      break
    }

    const parentExpression = expression.getExpression()
    if (Node.isCallExpression(parentExpression)) {
      length += 1
      expression = parentExpression.getExpression()
      continue
    }

    break
  }

  return length
}

export function getFluentChainText(call: CallExpression): string {
  let node: Node = call

  while (node.getParent()) {
    const parent = node.getParent()!

    if (Node.isCallExpression(parent)) {
      node = parent
      continue
    }

    if (
      Node.isReturnStatement(parent) ||
      Node.isVariableDeclaration(parent) ||
      Node.isExpressionStatement(parent) ||
      Node.isBinaryExpression(parent) ||
      Node.isAwaitExpression(parent)
    ) {
      break
    }

    break
  }

  if (Node.isReturnStatement(node.getParent())) {
    return node.getText()
  }

  if (Node.isVariableDeclaration(node.getParent())) {
    return node.getText()
  }

  return node.getText()
}

export function getPropertyNameFromCall(call: CallExpression): string | null {
  const expression = call.getExpression()
  if (!Node.isPropertyAccessExpression(expression)) {
    return null
  }

  return expression.getName()
}

export function isAwaitExpressionInsideLoop(node: Node): boolean {
  if (!Node.isAwaitExpression(node)) {
    return false
  }

  return isInsideLoop(node)
}

export function collectLoops(sourceFile: SourceFile): Node[] {
  return sourceFile.getDescendants().filter((node) => isLoopNode(node))
}

export function isNestedLoop(loop: Node): boolean {
  return getEnclosingLoops(loop).length > 0
}

export function loopContainsNestedLoop(loop: Node): boolean {
  for (const descendant of loop.getDescendants()) {
    if (descendant === loop) {
      continue
    }

    if (isLoopNode(descendant)) {
      return true
    }
  }

  return false
}
