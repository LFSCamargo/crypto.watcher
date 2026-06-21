import { Newspaper } from '@phosphor-icons/react'

type BlogHeroProps = {
  eyebrow?: string
  title: string
  description: string
}

export function BlogHero({
  eyebrow = 'Blog',
  title,
  description,
}: BlogHeroProps) {
  return (
    <div className="mb-12 border-b border-border/50 pb-8">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Newspaper size={14} weight="fill" />
        {eyebrow}
      </div>
      <h1 className="heading-2 mb-4 max-w-3xl text-balance">{title}</h1>
      <p className="body-large max-w-2xl text-balance">{description}</p>
    </div>
  )
}
