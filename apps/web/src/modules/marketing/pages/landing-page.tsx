import { AssetTicker } from '../components/asset-ticker'
import { HeroSection } from '../components/hero-section'
import { MethodologySection } from '../components/methodology-section'
import { LifecycleSection } from '../components/lifecycle-section'
import { ReferenceAssessmentsSection } from '../components/reference-assessments-section'
import { GovernanceSection } from '../components/governance-section'
import { ResourcesSection } from '../components/resources-section'
import { CTASection } from '../components/cta-section'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <AssetTicker />
      <MethodologySection />
      <LifecycleSection />
      <ReferenceAssessmentsSection />
      <GovernanceSection />
      <ResourcesSection />
      <CTASection />
    </>
  )
}
