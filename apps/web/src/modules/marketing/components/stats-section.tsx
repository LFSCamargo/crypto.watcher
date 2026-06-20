import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

const stats = [
  { value: 150, suffix: '+', label: 'Projects Analyzed' },
  { value: 5000, suffix: '+', label: 'Community Members' },
  { value: 98, suffix: '%', label: 'Accuracy Rate' },
  { value: 2, suffix: 'M+', label: 'Total Votes Cast' },
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: 'easeOut',
    })
    return controls.stop
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${latest.toLocaleString()}${suffix}`
      }
    })
    return unsubscribe
  }, [rounded, suffix])

  return <span ref={ref}>{`0${suffix}`}</span>
}

export function StatsSection() {
  return (
    <section className="relative border-t border-border/50">
      <div className="container-wide section-padding">
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold text-gradient md:text-5xl">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
