import { Link } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu'
import { ToneIcon } from '../ui/tone-icon'
import { resourceNavItems } from './navigation'

export function ResourcesMenu() {
  return (
    <NavigationMenu aria-label="Resources">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[440px] gap-1 p-2 sm:grid-cols-2">
              {resourceNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ToneIcon icon={item.icon} tone={item.tone} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
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
