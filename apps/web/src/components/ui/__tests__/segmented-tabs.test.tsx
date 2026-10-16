import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { SegmentedTabs, tabIds } from '../segmented-tabs'

const items = [
  { value: 'catalog', label: 'Catalog' },
  { value: 'queue', label: 'In analysis', count: 3 },
]

function Harness() {
  const [value, setValue] = useState('catalog')
  return (
    <>
      <SegmentedTabs
        label="Views"
        idPrefix="views"
        items={items}
        value={value}
        onValueChange={setValue}
      />
      <div role="tabpanel" {...tabIds('views', value).panel}>
        Panel {value}
      </div>
    </>
  )
}

describe('SegmentedTabs', () => {
  afterEach(cleanup)

  it('selects a tab on click and links it to its panel', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const queue = screen.getByRole('tab', { name: /In analysis/ })
    expect(queue).toHaveAttribute('aria-selected', 'false')
    await user.click(queue)
    expect(queue).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /In analysis/ })).toHaveTextContent(
      'Panel queue',
    )
  })

  it('moves between tabs with the arrow keys and keeps one tab stop', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const catalog = screen.getByRole('tab', { name: 'Catalog' })
    expect(catalog).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: /In analysis/ })).toHaveAttribute(
      'tabindex',
      '-1',
    )
    catalog.focus()
    await user.keyboard('{ArrowRight}')
    const queue = screen.getByRole('tab', { name: /In analysis/ })
    expect(queue).toHaveFocus()
    expect(queue).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}')
    expect(catalog).toHaveFocus()
  })

  it('shows counts next to labels', () => {
    render(<Harness />)
    expect(screen.getByRole('tab', { name: /In analysis/ })).toHaveTextContent('3')
  })
})
