import { Link } from 'react-router-dom'
import { Disclosure } from '../../../components/ui'

const questions = [
  {
    question: 'Can I buy CWT today?',
    answer:
      'No. CWT has not been minted and there is no sale. Anyone offering CWT today is not connected to Crypto Watcher.',
  },
  {
    question: 'When will CWT be minted?',
    answer:
      'No date is set. The mint and distribution will be announced on the blog before anything happens on-chain.',
  },
  {
    question: 'Will holding CWT change a project’s score?',
    answer:
      'No. CWT governs protocol policy only. Scores are published by the governor council and are never voted on.',
  },
  {
    question: 'Why are there proposal pages if voting isn’t open?',
    answer:
      'They are ready for launch. Once the Governor contract is deployed, proposals are indexed here and holders can vote from the app.',
  },
]

export function GovernanceFaq() {
  return (
    <section aria-labelledby="governance-faq-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="governance-faq-title" className="text-xl font-semibold">
          Common questions
        </h2>
        <Link
          to="/docs/governance"
          className="text-sm font-semibold underline underline-offset-2"
        >
          Read the governance guide
        </Link>
      </div>
      <div className="glass-card-flat divide-y divide-border rounded-3xl px-6">
        {questions.map(({ question, answer }) => (
          <Disclosure
            key={question}
            title={question}
            headingLevel={3}
            className="py-4"
            contentClassName="text-sm leading-relaxed text-muted-foreground"
          >
            {answer}
          </Disclosure>
        ))}
      </div>
    </section>
  )
}
