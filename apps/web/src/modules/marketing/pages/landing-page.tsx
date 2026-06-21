import { HeroSection } from '../components/hero-section'
import { ProblemSection } from '../components/problem-section'
import { ExpertReviewsSection } from '../components/expert-reviews-section'
import { EconomicsSection } from '../components/economics-section'
import { ValueSection } from '../components/value-section'
import { EcosystemImpactSection } from '../components/ecosystem-impact-section'
import { CTASection } from '../components/cta-section'

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <ExpertReviewsSection />
      <EconomicsSection />
      <ValueSection />
      <EcosystemImpactSection />
      <CTASection />
    </div>
  )
}
