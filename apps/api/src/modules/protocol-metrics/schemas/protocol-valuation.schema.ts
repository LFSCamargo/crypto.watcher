import { z } from '../../../core/openapi/zod'

export const ProtocolValuationSchema = z
  .object({
    feesAnnualizedUsd: z.number().nullable(),
    revenueAnnualizedUsd: z.number().nullable(),
    revenueCaptureRate: z.number().nullable(),
    revenueGrowth30d: z.number().nullable(),
    revenueGrowth1y: z.number().nullable(),
    feeSustainabilityScore: z.number().nullable(),
    governanceQualityScore: z.number().nullable(),
    securityScore: z.number().nullable(),
    compositeScore: z.number().nullable(),
    revenueToTvlRatio: z.number().nullable(),
    feeToTvlRatio: z.number().nullable(),
    priceToSalesRatio: z.number().nullable(),
    methodologyVersion: z.string(),
  })
  .openapi('ProtocolValuation')
