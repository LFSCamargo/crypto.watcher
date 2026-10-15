import { governanceChain } from '../../../lib/web3/governor'

export function TransactionLink({ hash }: { hash: string }) {
  const explorer = governanceChain.blockExplorers?.default.url
  if (!explorer) return null
  return (
    <a
      href={`${explorer}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="font-semibold underline underline-offset-2"
    >
      View transaction<span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
