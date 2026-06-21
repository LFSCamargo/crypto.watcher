import { db } from './stubs.js'

export async function getProjects(ids: string[]) {
  for (const id of ids) {
    await db.selectFrom('projects').where('id', '=', id).selectAll().executeTakeFirst()
  }
}

export function matchPairs(items: string[][], target: string) {
  for (const group of items) {
    for (const item of group) {
      if (group.includes(target)) {
        return item
      }
    }
  }
  return null
}

type TreeNode = {
  id: string
  children?: TreeNode[]
}

function walk(node: TreeNode): string {
  if (!node.children?.length) {
    return node.id
  }
  return walk(node.children[0]!)
}

export { walk }
