'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import InstallCounter from '@/components/trust/InstallCounter';
import ReviewCarousel from '@/components/trust/ReviewCarousel';
import { ArrowRight, Clock, Zap, CheckCircle2, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="bg-dark-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sun rounded-full mix-blend-screen filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-sun rounded-full mix-blend-screen filter blur-3xl opacity-50" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Headline */}
            <motion.h1 variants={itemVariants} className="font-bebas text-5xl sm:text-6xl lg:text-7xl text-sun tracking-widest mb-6">
              SOLAR SAVINGS
              <br />
              IN MINUTES
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto"
            >
              Get your personalized solar proposal in just 2 minutes. No paperwork. No BS.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bebas text-sun tracking-wide">
                  2<span className="text-sm">min</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">To your offer</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bebas text-sun tracking-wide">
                  120<span className="text-sm">s</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">No questions</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bebas text-sun tracking-wide">
                  5-7<span className="text-sm">d</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Installation</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <Button
                asChild
                size="lg"
                className="mb-4 sm:mb-0 inline-flex"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                <Link href="/get-quote">Get Your Free Quote</Link>
              </Button>
            </motion.div>

            {/* Trust statement */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-gray-500 mt-6"
            >
              Free, no obligation. Takes 120 seconds. Actual savings based on your utility data.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <InstallCounter />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From quote to system live in less than 8 weeks. Transparent, simple, fast.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Get Quote',
                desc: '2-minute questionnaire. AI analyzes your roof & utility data.',
                icon: Clock,
              },
              {
                num: '02',
                title: 'Review Proposal',
                desc: 'See your savings, payment options, and system details.',
                icon: Zap,
              },
              {
                num: '03',
                title: 'Sign & Schedule',
                desc: 'Digital signature. Pick your installation date.',
                icon: CheckCircle2,
              },
              {
                num: '04',
                title: 'System Live',
                desc: 'Inspection, permits, install, PTO. All included.',
                icon: Shield,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-sun/20 border border-sun flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-sun" />
                    </div>
                    <p className="text-sm font-dm-mono text-sun mb-2">{step.num}</p>
                    <h3 className="font-bebas text-2xl text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-400 flex-1">{step.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-4">
              HAPPY HOMEOWNERS
            </h2>
            <p className="text-gray-400">Real results from real people in your neighborhood</p>
          </motion.div>

          <ReviewCarousel />
        </div>
      </section>

      {/* Why Sunbull */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-4">
              WHY SUNBULL
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI-Powered Proposals',
                desc: 'Satellite imagery + real utility data = 99% accurate proposals',
              },
              {
                title: 'No Sales Pressure',
                desc: 'Get your proposal. Take your time. Call us when ready.',
              },
              {
                title: 'Trusted Installers',
                desc: 'Licensed, insured, NABCEP certified. 15+ years experience average.',
              },
              {
                title: '25-Year Guarantee',
                desc: 'Performance warranty. Maintenance included. Transferable warranty.',
              },
              {
                title: 'Same-Day Financing',
                desc: 'Get loan pre-approval instantly. No paperwork required.',
              },
              {
                title: 'Transparent Pricing',
                desc: 'No hidden fees. What we quote is what you pay. Guaranteed.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card>
                  <h3 className="font-bebas text-xl text-sun tracking-wide mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-6">
              Ready to Go Solar?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Get your personalized proposal in 2 minutes. No obligation.
            </p>
            <Button
              asChild
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              <Link href="/get-quote">Get Your Free Quote Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
