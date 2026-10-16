import { ProjectPricePanel } from '../../market/components/project-price-panel'
import { ProtocolMetricsPanel } from '../../protocol-metrics/components/protocol-metrics-panel'

export function MarketContextSection({ slug }: { slug: string }) {
  return (
    <section aria-labelledby="market-context-title" className="space-y-4">
      <div>
        <h2 id="market-context-title" className="text-base font-semibold">
          Market context
        </h2>
        <p className="text-sm text-muted-foreground">
          Live price and protocol data from third-party providers. It is not part of the
          safety score.
        </p>
      </div>
      <ProjectPricePanel slug={slug} />
      <ProtocolMetricsPanel slug={slug} />
    </section>
  )
}
