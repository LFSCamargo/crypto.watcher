import { db } from './stubs.js'

export async function getProjectsByIds(ids: string[]) {
  return db.selectFrom('projects').where('id', 'in', ids).select(['id', 'name']).limit(100).execute()
}

export function hasMatch(items: string[], target: string, lookup: Set<string>) {
  if (!lookup.has(target)) {
    return false
  }
  return items.some((item) => lookup.has(item))
}
