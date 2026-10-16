import { RiFundsLine, RiInformationLine } from '@remixicon/react'
import type { ProtocolMetricsSnapshot } from '../lib/protocol-metrics.types'
import { getValuationAvailability } from '../lib/valuation-availability'
import { hasDisplayableValuation } from '../lib/compute-protocol-valuation'
import { ProtocolValuationPanel } from './protocol-valuation-panel'

export function ProtocolValuationSection({ data }: { data: ProtocolMetricsSnapshot }) {
  const availability = getValuationAvailability(data)

  if (hasDisplayableValuation(data.valuation)) {
    return (
      <ProtocolValuationPanel valuation={data.valuation!} entityType={data.entityType} />
    )
  }

  if (availability.status === 'unavailable') {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <RiFundsLine className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">{availability.title}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {availability.description}
        </p>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <RiInformationLine className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          When available, we show annualized fees/revenue, revenue capture rate, fee
          sustainability, governance diversification proxy, security penalties, and a
          composite score (methodology CW-Valuation-v1).
        </p>
      </div>
    )
  }

  return null
}
