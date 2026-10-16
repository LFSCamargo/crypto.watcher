import type { Icon } from '@phosphor-icons/react'

export function DocsHero({
  icon: HeroIcon,
  eyebrow,
  title,
  description,
}: {
  icon: Icon
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-12 border-b border-border/50 pb-8">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-strong">
        <HeroIcon size={14} weight="fill" />
        {eyebrow}
      </div>
      <h1 className="heading-2 mb-4">{title}</h1>
      <p className="body-large max-w-2xl">{description}</p>
    </div>
  )
}
