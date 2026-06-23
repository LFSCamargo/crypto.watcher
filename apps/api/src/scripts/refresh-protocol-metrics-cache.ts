import { db } from '../core/db'

async function main() {
  const slugs = process.argv.slice(2)

  if (slugs.length === 0) {
    const deleted = await db.deleteFrom('protocol_metrics_cache').executeTakeFirst()
    console.log(`Cleared protocol metrics cache (${deleted.numDeletedRows ?? 0n} row(s)).`)
    return
  }

  const result = await db
    .deleteFrom('protocol_metrics_cache')
    .where('slug', 'in', slugs)
    .executeTakeFirst()

  console.log(`Cleared cache for: ${slugs.join(', ')} (${result.numDeletedRows ?? 0n} row(s)).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.destroy()
  })
