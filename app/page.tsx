"use client";
import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Activity, Zap, Shield, BarChart3, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      {/* Header */}
      <header className="container mx-auto px-12 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">RequestLens</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm p-3 font-medium text-muted-foreground hover:text-white transition-colors">
            Log in
          </Link>
          <Button asChild className="bg-primary px-6 py-5 hover:bg-primary/90 text-primary-foreground border-0">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>
      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-32 relative z-10 flex flex-col items-center">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Real-time Observability is here</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter mb-3 text-white leading-[1.1]">
            Monitor APIs in <span className="text-gradient">Real-Time</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Detect spikes, track latency, and troubleshoot failures before they impact your users. The premium observability dashboard for modern engineering teams.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        {/* Floating Dashboard Image Mockup */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="mt-24 w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full" />
          <div className="glass rounded-xl p-2 md:p-4 border border-white/10 shadow-2xl shadow-primary/20 relative">
            <div className="rounded-lg overflow-hidden bg-[#0F0F14] border border-white/5 aspect-[16/9] flex items-center justify-center relative">
              {/* Mock Dashboard Pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="w-full h-full p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="w-48 h-8 bg-white/5 rounded-md" />
                  <div className="w-32 h-8 bg-primary/20 rounded-md border border-primary/30" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-lg border border-white/5" />
                  ))}
                </div>
                <div className="flex-1 flex gap-4">
                  <div className="flex-[3] bg-white/5 rounded-lg border border-white/5 h-full relative overflow-hidden">
                    {/* Mock Chart line */}
                    <svg className="absolute bottom-0 w-full h-[80%] text-primary/50" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,50 Q20,20 40,60 T80,40 T100,20 L100,100 Z" fill="currentColor" opacity="0.2" />
                      <path d="M0,50 Q20,20 40,60 T80,40 T100,20" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg border border-white/5 h-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Features Section */}
        <div className="mt-32 max-w-6xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Everything you need to monitor APIs</h2>
            <p className="text-muted-foreground">Built for speed, reliability, and precision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-6 h-6 text-primary" />,
                title: "Spike Detection",
                desc: "Instantly know when traffic surges or drops unexpectedly across all your endpoints."
              },
              {
                icon: <Database className="w-6 h-6 text-primary" />,
                title: "Log Tracking",
                desc: "Search and filter through millions of API logs in milliseconds to find the root cause."
              },
              {
                icon: <Globe className="w-6 h-6 text-primary" />,
                title: "Latency Analysis",
                desc: "Monitor P95 and P99 response times to ensure smooth experiences for all users."
              },
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: "Error Breakdowns",
                desc: "Categorize failures by status code, endpoint, and user to prioritize fixes."
              },
              {
                icon: <Activity className="w-6 h-6 text-primary" />,
                title: "Live Dashboard",
                desc: "Watch your API health in real-time with auto-refreshing charts and metrics."
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Instant Setup",
                desc: "Integrate with your existing Node, Python, or Go stack in under 5 minutes."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          {/* CTA Section */}
          <div className="mt-32 max-w-6xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass p-12 rounded-3xl border border-primary/20 bg-primary/5 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 pointer-events-none" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to trace your pulses?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
                Join thousands of developers building more reliable APIs. Set up in under 5 minutes. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Button asChild size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90">
                  <Link href="/register">Start for free</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}