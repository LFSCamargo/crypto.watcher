import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { HowItWorksSection } from './components/how-it-works'
import { StatsSection } from './components/stats-section'
import { ReferenceProjectsSection } from './components/reference-projects-section'
import { CTASection } from './components/cta-section'
import { Footer } from './components/footer'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ReferenceProjectsSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </>
  )
}
