import { BlueprintGrid, GridAccent } from '../ui/blueprint-grid'

export function PageGridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(960px,88vh)] overflow-hidden"
      aria-hidden
    >
      <BlueprintGrid accent />
      <GridAccent />
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-b from-transparent via-background/70 to-background" />
    </div>
  )
}
