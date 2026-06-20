import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Users, ChartLineUp } from '@phosphor-icons/react'
import { Button } from '../../../components/ui'
import { ProjectSearch } from '../../projects/components/project-search'

const trustPoints = [
  { icon: ShieldCheck, label: 'Trust-based voting' },
  { icon: Users, label: 'Community driven' },
  { icon: ChartLineUp, label: 'On-chain scores' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow that echoes the gold shield */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute left-1/4 top-40 h-64 w-64 rounded-full bg-brand-orange/10 blur-[100px]" />
        <div className="absolute right-1/4 top-52 h-64 w-64 rounded-full bg-brand-teal/10 blur-[100px]" />
      </div>

      <div className="container-wide relative section-padding">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.img
            src="/logo.png"
            alt="Crypto Watcher shield"
            className="relative mb-8 h-52 w-52 object-contain drop-shadow-[0_12px_60px_rgba(245,184,0,0.4)] md:h-64 md:w-64"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.6, ease: 'easeOut' },
              scale: { duration: 0.6, ease: 'easeOut' },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
            }}
            draggable={false}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Now live on Base Sepolia Testnet
            </div>
          </motion.div>

          <motion.h1
            className="heading-1 mb-6 text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Your <span className="text-gradient">shield</span> against risky
            crypto projects
          </motion.h1>

          <motion.p
            className="body-large mx-auto mb-8 max-w-xl text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Search crypto projects before you connect a wallet. Start with recognized
            market assets, then use reputation-weighted community signals when you need
            deeper risk analysis.
          </motion.p>

          <motion.div
            className="mb-6 w-full max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
          >
            <ProjectSearch />
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/app">
                Launch App
                <ArrowRight size={18} weight="bold" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">Read Documentation</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {trustPoints.map((point) => (
              <div
                key={point.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <point.icon size={18} weight="duotone" className="text-primary" />
                {point.label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
