import { Link } from 'react-router-dom'
import {
  RiBookOpenLine,
  RiCoinsLine,
  RiFileTextLine,
  RiGovernmentLine,
  RiNewsLine,
  RiQuestionLine,
} from '@remixicon/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu'

const resources = [
  {
    to: '/blog',
    icon: RiNewsLine,
    title: 'Blog',
    description: 'Launch story, updates and roadmap news.',
  },
  {
    to: '/docs',
    icon: RiBookOpenLine,
    title: 'Introduction',
    description: 'What Crypto Watcher is and how reviews work.',
  },
  {
    to: '/docs/whitepaper',
    icon: RiFileTextLine,
    title: 'Whitepaper',
    description: 'The thesis behind our risk-review model.',
  },
  {
    to: '/docs/tokenomics',
    icon: RiCoinsLine,
    title: 'Tokenomics',
    description: 'Protocol governance and reviewer council policy.',
  },
  {
    to: '/docs/governance',
    icon: RiGovernmentLine,
    title: 'Governance',
    description: 'Expert council reviews and protocol governance.',
  },
  {
    to: '/docs/faq',
    icon: RiQuestionLine,
    title: 'FAQ',
    description: 'Common questions, fees and safety scores.',
  },
]

export function ResourcesMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] gap-1 p-2 sm:grid-cols-2">
              {resources.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-foreground">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
