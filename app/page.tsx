'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  StarIcon,
  PaintBrushIcon,
  CloudArrowUpIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const el = ref.current
    if (el) {
      el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((child) =>
        observer.observe(child)
      )
    }
    return () => observer.disconnect()
  }, [])
  return ref
}

// Animated counter component
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const duration = 2000
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// FAQ Accordion Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-surface-muted transition-colors"
      >
        <span className="text-lg font-semibold text-text-primary-dark pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-brand flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-5">
          <p className="text-text-body leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const scrollRef = useScrollReveal()

  const comparisonFeatures = [
    { feature: 'Free Plan', stripeform: true, typeform: 'Limited', google: true, jotform: 'Limited' },
    { feature: 'No Account Required', stripeform: true, typeform: false, google: false, jotform: false },
    { feature: 'Drag & Drop Builder', stripeform: true, typeform: true, google: 'Basic', jotform: true },
    { feature: 'Custom Branding', stripeform: true, typeform: 'Pro only', google: false, jotform: 'Paid' },
    { feature: 'Payment Integration', stripeform: true, typeform: 'Pro only', google: false, jotform: 'Paid' },
    { feature: 'Real-time Analytics', stripeform: true, typeform: 'Pro only', google: 'Basic', jotform: 'Paid' },
    { feature: 'Conditional Logic', stripeform: true, typeform: true, google: false, jotform: true },
    { feature: 'Starting Price', stripeform: '$0', typeform: '$25/mo', google: '$0', jotform: '$34/mo' },
  ]

  const features = [
    { icon: SparklesIcon, title: 'Typewriter Animations', desc: 'Captivating text effects that grab attention' },
    { icon: PaintBrushIcon, title: 'Brand Kit', desc: 'Your colors, fonts, and logo on every form' },
    { icon: ArrowsPointingOutIcon, title: 'Multiple Layouts', desc: 'Vertical, horizontal, grid, and typeform-style' },
    { icon: ChartBarIcon, title: 'Analytics Dashboard', desc: 'Track views, completions, and drop-offs in real time' },
    { icon: BoltIcon, title: 'Conditional Logic', desc: 'Show/hide questions based on previous answers' },
    { icon: CloudArrowUpIcon, title: 'File Uploads', desc: 'Accept documents, images, and videos securely' },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'Marketing Director, TechFlow', quote: 'StripeForm tripled our lead capture rate. The forms are so beautiful that people actually want to fill them out.', stars: 5 },
    { name: 'Marcus Johnson', role: 'Founder, EventPro', quote: 'We replaced Typeform and saved $200/month. StripeForm has more features at a fraction of the cost.', stars: 5 },
    { name: 'Emily Rodriguez', role: 'HR Manager, ScaleUp Inc', quote: 'Our job application completion rate went from 34% to 89%. The drag-and-drop builder made it incredibly easy to set up.', stars: 5 },
  ]

  const faqs = [
    { q: 'Do I need an account to create forms?', a: 'No! You can start building forms instantly without creating an account. When you\'re ready to save and track responses, you can create a free account in seconds.' },
    { q: 'How is StripeForm different from Typeform or Google Forms?', a: 'StripeForm combines the beauty of Typeform with the simplicity of Google Forms — at a fraction of the cost. Plus, features like no-account form creation, built-in payments, and real-time analytics come standard.' },
    { q: 'Can I accept payments through my forms?', a: 'Yes! StripeForm integrates directly with Stripe for seamless payment collection. Accept one-time payments, recurring subscriptions, or donations right in your forms.' },
    { q: 'Is there a limit on form responses?', a: 'Free plans include generous response limits. Pro plans offer unlimited responses, advanced analytics, and priority support for just $5/month.' },
    { q: 'Can I customize the look and feel of my forms?', a: 'Absolutely. Use our Brand Kit to apply your colors, fonts, and logo. Choose from multiple layouts (vertical, horizontal, grid, typeform-style) and add custom CSS for complete control.' },
    { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade encryption, HTTPS everywhere, and comply with GDPR. Your data is stored securely and never shared with third parties.' },
  ]

  return (
    <div ref={scrollRef} className="min-h-screen bg-white overflow-hidden">

      {/* ====== HERO SECTION ====== */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Glassmorphism floating bubbles */}
        <div className="hero-glass-bubble hero-glass-bubble-1" />
        <div className="hero-glass-bubble hero-glass-bubble-2" />
        <div className="hero-glass-bubble hero-glass-bubble-3" />
        <div className="hero-glass-bubble hero-glass-bubble-4" />
        <div className="hero-glass-bubble hero-glass-bubble-5" />
        <div className="hero-glass-bubble hero-glass-bubble-6" />

        {/* Decorative rings */}
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />

        {/* Floating dots */}
        <div className="hero-dot hero-dot-1" />
        <div className="hero-dot hero-dot-2" />
        <div className="hero-dot hero-dot-3" />
        <div className="hero-dot hero-dot-4" />
        <div className="hero-dot hero-dot-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary-dark mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Stop Losing{' '}
              <span className="gradient-text-brand">67% of Your Leads</span>{' '}
              to Ugly, Boring Forms
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-text-body mb-4 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Create stunning, interactive forms that people <em>actually love</em> to fill out.
              Higher completion rates. More leads. Zero coding required.
            </motion.p>

            <motion.p
              className="text-base text-brand font-semibold mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              No account needed. Start creating forms in 30 seconds.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/builder"
                prefetch={true}
                className="btn-glow bg-brand text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-brand-dark transition-all inline-flex items-center justify-center gap-2"
              >
                Build Your First Form Free
              </Link>
              <Link
                href="/templates"
                prefetch={true}
                className="bg-white text-text-primary-dark px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-200 hover:border-brand-200 hover:bg-brand-50 transition-all inline-flex items-center justify-center"
              >
                Browse Templates
              </Link>
            </motion.div>
          </div>

          {/* Hero Mockup Card */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-card-strong rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-5 border border-brand-100">
                  <p className="text-sm font-medium text-text-muted-custom mb-1">Response Rate</p>
                  <p className="text-3xl font-bold text-brand">89%</p>
                  <p className="text-xs text-accent-teal font-medium mt-1">↑ 34% vs industry avg</p>
                </div>
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-5 border border-brand-100">
                  <p className="text-sm font-medium text-text-muted-custom mb-1">Forms Created</p>
                  <p className="text-3xl font-bold text-text-primary-dark">50K+</p>
                  <p className="text-xs text-accent-teal font-medium mt-1">Growing every day</p>
                </div>
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-5 border border-brand-100">
                  <p className="text-sm font-medium text-text-muted-custom mb-1">Avg Setup Time</p>
                  <p className="text-3xl font-bold text-text-primary-dark">2min</p>
                  <p className="text-xs text-accent-teal font-medium mt-1">No coding required</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== USE CASES SECTION ====== */}
      <section className="py-20 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">Use Cases</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              One builder. Endless possibilities.
            </h2>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              Whether you&apos;re capturing leads, collecting payments, or gathering feedback, StripeForm adapts to your needs.
            </p>
          </div>

          {/* Featured use cases with people photos */}
          <div className="grid md:grid-cols-3 gap-6 mb-6 stagger-children">
            {/* Lead Generation - Featured */}
            <div className="reveal glass-card-strong rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/people/lead-gen.png"
                  alt="Marketing professional using StripeForm for lead generation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand text-white">
                    Lead Generation
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-text-primary-dark mb-2">Capture More Qualified Leads</h3>
                <p className="text-text-body text-sm leading-relaxed">High-converting multi-step forms that turn visitors into qualified leads. Smart conditional logic keeps them engaged.</p>
              </div>
            </div>

            {/* Events - Featured */}
            <div className="reveal glass-card-strong rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/people/events.png"
                  alt="Event planner managing registrations with StripeForm"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-teal text-white">
                    Event Registration
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-text-primary-dark mb-2">Seamless Event Sign-ups</h3>
                <p className="text-text-body text-sm leading-relaxed">Beautiful RSVP and registration flows with built-in payment processing. From conferences to workshops.</p>
              </div>
            </div>

            {/* Feedback - Featured */}
            <div className="reveal glass-card-strong rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/people/team-collab.png"
                  alt="Team collaborating on customer feedback using StripeForm"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-warm text-white">
                    Feedback & Surveys
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-text-primary-dark mb-2">Understand Your Customers</h3>
                <p className="text-text-body text-sm leading-relaxed">NPS, CSAT, and custom surveys with real-time analytics. Make data-driven decisions that grow your business.</p>
              </div>
            </div>
          </div>

          {/* Supporting use cases */}
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {[
              { icon: ClipboardDocumentCheckIcon, title: 'Customer Surveys', desc: 'Get real feedback with forms people actually enjoy filling out' },
              { icon: BriefcaseIcon, title: 'Job Applications', desc: 'Streamlined candidate intake with file uploads and conditional logic' },
              { icon: ShoppingCartIcon, title: 'Order Forms', desc: 'Accept payments directly through your forms via Stripe integration' },
            ].map((uc, i) => (
              <div
                key={i}
                className="reveal glass-card-strong rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <uc.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary-dark mb-2">{uc.title}</h3>
                <p className="text-text-body text-sm leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PROBLEM → SOLUTION BENTO ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Your current forms are <span className="text-accent-warm">costing you money</span>
            </h2>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              Every abandoned form is a lost customer. Here's how StripeForm fixes that.
            </p>
          </div>

          <div className="bento-grid-asymmetric stagger-children">
            {/* Featured card */}
            <div className="reveal bento-featured bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-8 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Low Response Rates?</h3>
              <p className="text-white/80 mb-4 leading-relaxed">
                Average form completion is just 33%. StripeForm users see <strong className="text-white">89% completion rates</strong> thanks to beautiful design, one-question-at-a-time flow, and typewriter animations that keep users engaged.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-white/90">
                <CheckIcon className="w-4 h-4 mr-2" /> Beautiful by default
              </span>
            </div>

            <div className="reveal glass-card-strong rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center mb-3">
                <BoltIcon className="w-5 h-5 text-accent-teal" />
              </div>
              <h3 className="text-lg font-bold text-text-primary-dark mb-2">Complex Builders?</h3>
              <p className="text-text-body text-sm">Intuitive drag & drop. Build in minutes, not hours.</p>
            </div>

            <div className="reveal glass-card-strong rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                <PresentationChartLineIcon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-text-primary-dark mb-2">No Analytics?</h3>
              <p className="text-text-body text-sm">Real-time insights on views, completions, and drop-offs.</p>
            </div>

            <div className="reveal glass-card-strong rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-warm/10 flex items-center justify-center mb-3">
                <ClipboardDocumentIcon className="w-5 h-5 text-accent-warm" />
              </div>
              <h3 className="text-lg font-bold text-text-primary-dark mb-2">Slow Setup?</h3>
              <p className="text-text-body text-sm">Start instantly — no account needed. Create in 30 seconds.</p>
            </div>

            <div className="reveal glass-card-strong rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center mb-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-accent-teal" />
              </div>
              <h3 className="text-lg font-bold text-text-primary-dark mb-2">Poor Mobile?</h3>
              <p className="text-text-body text-sm">Mobile-first design that looks perfect on every device.</p>
            </div>

            <div className="reveal glass-card-strong rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-text-primary-dark mb-2">No Payments?</h3>
              <p className="text-text-body text-sm">Stripe integration for seamless payment collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SOCIAL PROOF STATS ====== */}
      <section className="py-16 bg-gradient-to-r from-brand via-brand-dark to-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="reveal">
              <p className="text-3xl sm:text-4xl font-bold"><AnimatedCounter end={2400} suffix="+" /></p>
              <p className="text-white/70 mt-1 text-sm">Active Users</p>
            </div>
            <div className="reveal">
              <p className="text-3xl sm:text-4xl font-bold"><AnimatedCounter end={50} suffix="K+" /></p>
              <p className="text-white/70 mt-1 text-sm">Forms Created</p>
            </div>
            <div className="reveal">
              <p className="text-3xl sm:text-4xl font-bold"><AnimatedCounter end={89} suffix="%" /></p>
              <p className="text-white/70 mt-1 text-sm">Avg Completion Rate</p>
            </div>
            <div className="reveal">
              <p className="text-3xl sm:text-4xl font-bold"><AnimatedCounter end={49} prefix="" suffix="" /><span className="text-2xl">/5</span></p>
              <p className="text-white/70 mt-1 text-sm">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== COMPETITOR COMPARISON ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">Comparison</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              See how StripeForm <span className="gradient-text-brand">stacks up</span>
            </h2>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              More features. Lower price. Better experience.
            </p>
          </div>

          <div className="reveal overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-text-body font-medium text-sm">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand text-white text-sm font-bold">StripeForm</span>
                  </th>
                  <th className="py-4 px-4 text-center text-text-body font-medium text-sm">Typeform</th>
                  <th className="py-4 px-4 text-center text-text-body font-medium text-sm hidden sm:table-cell">Google Forms</th>
                  <th className="py-4 px-4 text-center text-text-body font-medium text-sm hidden md:table-cell">JotForm</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-surface-muted' : 'bg-white'}`}>
                    <td className="py-4 px-4 text-sm font-medium text-text-primary-dark">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.stripeform === 'boolean' ? (
                        row.stripeform ? <CheckIcon className="w-5 h-5 text-accent-teal mx-auto" /> : <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-sm font-semibold text-brand">{row.stripeform}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.typeform === 'boolean' ? (
                        row.typeform ? <CheckIcon className="w-5 h-5 text-gray-400 mx-auto" /> : <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-xs text-text-muted-custom">{row.typeform}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center hidden sm:table-cell">
                      {typeof row.google === 'boolean' ? (
                        row.google ? <CheckIcon className="w-5 h-5 text-gray-400 mx-auto" /> : <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-xs text-text-muted-custom">{row.google}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center hidden md:table-cell">
                      {typeof row.jotform === 'boolean' ? (
                        row.jotform ? <CheckIcon className="w-5 h-5 text-gray-400 mx-auto" /> : <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-xs text-text-muted-custom">{row.jotform}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-20 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Live in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: '01', title: 'Choose a Template', desc: 'Pick from 50+ professionally designed templates or start from scratch.', icon: DocumentTextIcon },
              { step: '02', title: 'Drag, Drop, Customize', desc: 'Add questions, set logic, brand it with your colors — all visually.', icon: ArrowsPointingOutIcon },
              { step: '03', title: 'Share & Collect', desc: 'Publish with one click. Share a link. Watch responses flow in real-time.', icon: PresentationChartLineIcon },
            ].map((s, i) => (
              <div key={i} className="reveal text-center">
                <div className="glass-card-strong rounded-2xl p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto mb-5 text-lg font-bold">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary-dark mb-3">{s.title}</h3>
                  <p className="text-text-body leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== INTERACTIVE DEMO ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">See The Difference</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Experience a StripeForm — right now
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Form Preview */}
            <div className="reveal glass-card-strong rounded-3xl p-8 animate-glow-pulse">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-text-primary-dark mb-1">Customer Feedback</h3>
                <p className="text-sm text-text-muted-custom">Question 2 of 5</p>
              </div>
              <div className="mb-6">
                <p className="text-lg text-text-primary-dark mb-4">How would you rate your experience?</p>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-300 hover:scale-110 ${num === 4
                        ? 'bg-brand text-white shadow-lg shadow-brand/30'
                        : 'bg-gray-100 text-text-body hover:bg-brand-50'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button className="text-text-muted-custom hover:text-text-body transition-colors">← Back</button>
                <button className="btn-glow bg-brand text-white px-6 py-2 rounded-xl font-semibold hover:bg-brand-dark transition-all">
                  Next →
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="reveal-right space-y-5">
              <h3 className="text-2xl font-bold text-text-primary-dark mb-6">Beautiful form experience</h3>
              {[
                'Typewriter animations that capture attention',
                'Smooth transitions between questions',
                'Mobile-responsive on any device',
                'One question at a time reduces cognitive load',
                'Visual progress indicator keeps users engaged',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckIcon className="w-4 h-4 text-accent-teal" />
                  </div>
                  <p className="text-text-body">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES DEEP-DIVE ====== */}
      <section className="py-20 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="bento-grid-2x3 stagger-children">
            {features.map((f, i) => (
              <div key={i} className="reveal glass-card-strong rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <f.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary-dark mb-2">{f.title}</h3>
                <p className="text-text-body text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Loved by businesses everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {testimonials.map((t, i) => (
              <div key={i} className="reveal glass-card-strong rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <StarIcon key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-text-body mb-5 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-text-primary-dark">{t.name}</p>
                  <p className="text-sm text-text-muted-custom">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRICING TEASER ====== */}
      <section className="py-20 bg-surface-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              No credit card required. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {/* Free */}
            <div className="reveal glass-card-strong rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text-primary-dark mb-1">Free</h3>
              <p className="text-3xl font-bold text-text-primary-dark mb-1">$0 <span className="text-sm font-normal text-text-muted-custom">forever</span></p>
              <p className="text-sm text-text-body mb-5">Perfect for getting started</p>
              <ul className="space-y-2 mb-6 text-sm text-text-body">
                {['Up to 5 published forms', 'Unlimited drafts', 'Basic analytics', 'Mobile responsive'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-accent-teal flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full text-center bg-gray-100 text-text-primary-dark py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Start Free
              </Link>
            </div>
            {/* Pro */}
            <div className="reveal glass-card-strong rounded-2xl p-6 ring-2 ring-brand relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-3 py-1 rounded-full text-xs font-bold">Most Popular</span>
              <h3 className="text-lg font-bold text-text-primary-dark mb-1">Pro</h3>
              <p className="text-3xl font-bold text-text-primary-dark mb-1">$5 <span className="text-sm font-normal text-text-muted-custom">/month</span></p>
              <p className="text-sm text-text-body mb-5">For growing businesses</p>
              <ul className="space-y-2 mb-6 text-sm text-text-body">
                {['Unlimited forms', 'Advanced analytics', 'Custom branding', 'Payment integration', 'Priority support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-accent-teal flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center btn-glow bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all">
                Upgrade to Pro
              </Link>
            </div>
            {/* Enterprise */}
            <div className="reveal glass-card-strong rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text-primary-dark mb-1">Enterprise</h3>
              <p className="text-3xl font-bold text-text-primary-dark mb-1">Custom</p>
              <p className="text-sm text-text-body mb-5">For large organizations</p>
              <ul className="space-y-2 mb-6 text-sm text-text-body">
                {['Everything in Pro', 'SSO & team management', 'Custom integrations', 'Dedicated support', 'SLA guarantee'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-accent-teal flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/contact" className="block w-full text-center bg-gray-100 text-text-primary-dark py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-dark mt-3 mb-4">
              Got questions? We&apos;ve got answers.
            </h2>
          </div>

          <div className="space-y-3 stagger-children">
            {faqs.map((faq, i) => (
              <div key={i} className="reveal">
                <FAQItem question={faq.q} answer={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-24 bg-gradient-to-br from-brand via-brand-dark to-brand-800 relative overflow-hidden">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.15 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.1 }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Every day without StripeForm is another day of lost leads
            </h2>
            <p className="text-xl text-white/80 mb-4 max-w-2xl mx-auto">
              Join 2,400+ businesses already creating forms people love.
            </p>
            <p className="text-white/60 mb-8">
              No account needed. No credit card. Start in 30 seconds.
            </p>
            <Link
              href="/builder"
              prefetch={true}
              className="inline-flex items-center bg-white text-brand px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 hover:shadow-xl transition-all"
            >
              Build Your First Form Free
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-text-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg gradient-text-brand">StripeForm</span>
              <span className="bg-brand/20 text-brand-300 text-xs px-2 py-1 rounded-full font-medium">BETA</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; 2025 StripeForm. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://twitter.com/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://linkedin.com/company/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://facebook.com/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}