import { RiShieldCheckLine } from '@remixicon/react'
import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const messages = [
  {
    author: 'mira.eth',
    text: 'The proxy admin is an EOA, not the multisig the docs mention.',
    council: false,
  },
  {
    author: 'dev_ops',
    text: 'Here is the second audit, published last month.',
    council: false,
  },
  {
    author: 'Governor council',
    text: 'Evidence logged. We will cover both in the report.',
    council: true,
  },
]

export function DiscussionCard({ className }: { className?: string }) {
  return (
    <SpotlightCard
      tone="sky"
      aria-labelledby="discussion-card-title"
      className={cn('space-y-5', className)}
    >
      <div className="space-y-2">
        <h3 id="discussion-card-title" className="text-xl font-bold">
          Anyone can bring evidence
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Read every report and join the discussion. The council weighs what you share
          before it publishes the final score.
        </p>
      </div>
      <ul aria-label="Example discussion" className="space-y-2.5">
        {messages.map((message, index) => (
          <li
            key={message.author}
            style={{ animationDelay: `${index * 80}ms` }}
            className={cn('landing-enter flex', message.council && 'justify-end')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                message.council
                  ? 'rounded-br-md bg-tone-violet/15'
                  : 'rounded-bl-md border border-border bg-background/80',
              )}
            >
              <p className="mb-0.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                {message.council && (
                  <RiShieldCheckLine
                    aria-hidden
                    className="h-3.5 w-3.5 text-tone-violet-strong"
                  />
                )}
                {message.author}
              </p>
              {message.text}
            </div>
          </li>
        ))}
        <li aria-hidden className="flex gap-1 pl-2 pt-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
        </li>
      </ul>
    </SpotlightCard>
  )
}
