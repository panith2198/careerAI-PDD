import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RocketIcon, 
  Briefcase01Icon, 
  RouteIcon, 
  Task01Icon, 
  UserGroupIcon,
  ChatBotIcon,
  GlobalIcon,
  AnalyticsUpIcon,
  Settings01Icon,
  SecurityIcon,
  Notification01Icon
} from '@hugeicons/core-free-icons';
import useAuthStore from '@/stores/authStore';
import Logo from '@/components/common/Logo';

// Custom SVG animations
import HudOrbitAnimation from '@/components/common/animations/HudOrbitAnimation';
import BrandIdentityAnimation from '@/components/common/animations/BrandIdentityAnimation';
import RoadmapFlowAnimation from '@/components/common/animations/RoadmapFlowAnimation';
import InteractiveAdvisorChatbotAnimation from '@/components/common/animations/InteractiveAdvisorChatbotAnimation';
import AtsFeedbackAnimation from '@/components/common/animations/AtsFeedbackAnimation';
import ValidateAssessmentDecksAnimation from '@/components/common/animations/ValidateAssessmentDecksAnimation';
import AiJobMatchingAnimation from '@/components/common/animations/AiJobMatchingAnimation';

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Common animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative selection:bg-primary-dim selection:text-primary-glow">
      {/* Deep Space Background Overlay Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-cyan-brand/5 rounded blur-3xl pointer-events-none"></div>
      <div className="absolute top-2/4 left-10 w-[600px] h-[600px] bg-primary/5 rounded blur-3xl pointer-events-none"></div>
      <div className="absolute top-3/4 right-10 w-[800px] h-[800px] bg-cyan-brand/5 rounded blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-12 fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="font-heading text-sm font-bold tracking-wider text-primary-glow">CareerAi</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION CONTAINER WITH GRID BOXES & ANIMATED GRADIENT */}
      <div className="relative w-full overflow-hidden border-b border-border bg-gradient-to-b from-transparent to-surface-1/10 pt-16">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        />

        {/* Animated Gradient Orbs */}
        <motion.div 
          className="absolute -top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded blur-3xl pointer-events-none z-0"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.85, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-brand/5 rounded blur-3xl pointer-events-none z-0"
          animate={{
            x: [0, -50, 60, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.85, 1.15, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* SECTION 1: HERO HUB ORBIT */}
        <section className="relative px-6 md:px-12 py-20 lg:py-32 max-w-5xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div 
            className="flex flex-col items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="pro" className="mb-6 w-fit animate-pulse">
              <HugeiconsIcon icon={RocketIcon} strokeWidth={2} className="size-3 mr-1" />
              CINEMATIC ORBIT V2.0 ACTIVE
            </Badge>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-text-primary leading-tight mb-6 max-w-4xl">
              Command Your Career Orbit with <span className="bg-gradient-to-r from-primary-glow via-primary-bright to-cyan-brand bg-clip-text text-transparent">AI Precision</span>
            </h1>
            
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl mb-10 leading-relaxed">
              Navigate career transitions and verify industry skill gaps using native Android Hilt architectures and web vector search grids.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-12">
              <Button size="lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} className="w-full sm:w-64">
                Initialize Free Pilot
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-64">
                Log In to Console
              </Button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* SECTION 2: BRANDING & CORE MISSION */}
      <section className="px-6 md:px-12 py-20 bg-surface-1/20 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-5 flex justify-center relative"
            initial={{ opacity: 0, rotate: -10 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <BrandIdentityAnimation />
          </motion.div>

          <motion.div 
            className="lg:col-span-7 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              Brand Identity
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
              The Career Arrow & Circuit Blueprint
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              CareerAi is represented by an upwards-oriented gradient arrow intersecting circuit paths and node junctions. This symbolizes career elevation, technological convergence, and continuous growth.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-2/50 border border-border rounded-xl">
                <span className="text-xs font-semibold text-primary-glow font-mono uppercase block mb-1">Career Arrow</span>
                <span className="text-xs text-text-secondary">Represents the upwards trajectory of learning, experience, and promotion matches.</span>
              </div>
              <div className="p-4 bg-surface-2/50 border border-border rounded-xl">
                <span className="text-xs font-semibold text-cyan-brand font-mono uppercase block mb-1">Circuit Grids</span>
                <span className="text-xs text-text-secondary">Depicts neural indexing nodes mapping user credentials directly to dynamic vacancy specifications.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: AI LEARNING ROADMAPS */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-7 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Phase-Based Curriculum
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Autonomous Skill Roadmaps
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Analyze skill gaps and generate a 3-phase roadmap outlining core foundations, specialist concepts, and ultimate role mastery. Track timeline guidelines, estimated study durations, and validation node markers.
          </p>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded bg-primary-glow" />
              Phase 1: Industry-validated skill foundations.
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded bg-cyan-brand" />
              Phase 2: Specific tools, framework configurations, and project setups.
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded bg-primary-glow" />
              Phase 3: Advanced architecture, scale management, and advisor audits.
            </li>
          </ul>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <RoadmapFlowAnimation />
        </motion.div>
      </section>

      {/* SECTION 4: RAG CHATBOT COUNSELING */}
      <section className="px-6 md:px-12 py-20 bg-surface-1/25 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-5 flex justify-center order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <InteractiveAdvisorChatbotAnimation />
          </motion.div>

          <motion.div 
            className="lg:col-span-7 text-left order-1 lg:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              RAG Retrieval Engine
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Interactive Advisor chatbot
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Consult a RAG-powered counselor. Prompt questions regarding salary expectations, education guidelines, or relocation options. The engine indexes document vaults, retrieves semantic context nodes, and compiles verified advice logs.
            </p>
            <div className="p-4 bg-surface-2 border border-border rounded-xl flex items-start gap-4">
              <HugeiconsIcon icon={ChatBotIcon} strokeWidth={2} className="size-8 text-cyan-brand shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text-primary mb-1">Semantic Context Matching</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Queries are converted into dense vector formats and compared using cosine distance metrics to isolate exact learning references.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: ADAPTIVE SKILL QUIZZES */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-7 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Time-Gated Testing
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Validated Assessment Decks
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Test competency through adaptive testing. Quiz metrics calculate validation parameters and map progress updates directly to a responsive radar breakdown score sheet.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Quiz Progress (Kotlin Coroutines)</span>
              <span className="text-primary-glow font-mono font-bold">85% Complete</span>
            </div>
            <div className="h-2 w-full bg-surface-3 rounded overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-cyan-brand rounded"
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ValidateAssessmentDecksAnimation />
        </motion.div>
      </section>

      {/* SECTION 6: AI JOB MATCH INDEX */}
      <section className="px-6 md:px-12 py-20 bg-surface-1/20 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AiJobMatchingAnimation />
          </motion.div>

          <motion.div 
            className="lg:col-span-7 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              Vacancy Indexing
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
              AI Job Match Scoring
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Match user indicators with active vacancy roles. The match index computes keyword validation scores, salary target fits, and skill alignments in real-time, outputting clean indices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <HugeiconsIcon icon={AnalyticsUpIcon} strokeWidth={2} className="size-5 text-primary-glow" />
                <div>
                  <h4 className="text-xs font-semibold text-text-primary mb-1">Priority Weights</h4>
                  <p className="text-xs text-text-secondary">Configure priority parameters to emphasize salary limits or specific frameworks.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} className="size-5 text-cyan-brand" />
                <div>
                  <h4 className="text-xs font-semibold text-text-primary mb-1">Instant Notifications</h4>
                  <p className="text-xs text-text-secondary">Receive alerts as soon as new job postings match 80% or more of your active dashboard nodes.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* SECTION 8: ATS RESUME SCORER */}
      <section className="px-6 md:px-12 py-20 bg-surface-1/20 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-5 flex justify-center order-2 lg:order-1"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AtsFeedbackAnimation />
          </motion.div>

          <motion.div 
            className="lg:col-span-7 text-left order-1 lg:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              Resume Scorer
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
              ATS Feedback System
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Upload your resume to check alignment. The engine scans the file to isolate keyword gaps, formatting problems, and structural improvements, outputting actionable ratings.
            </p>
            <div className="flex gap-4">
              <HugeiconsIcon icon={GlobalIcon} strokeWidth={2} className="size-6 text-primary-glow shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-text-primary mb-1">Standard Parsers</h4>
                <p className="text-xs text-text-secondary">Strict evaluation matching PDF and DOCX schemas used by top tier tech organizations.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* SECTION 10: ARCHITECTURE & TECH STACK */}
      <section className="px-6 md:px-12 py-20 bg-surface-1/20 border-y border-border">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              System Engineering
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Platform Architecture
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">
              CareerAi is engineered with reliable native patterns, structured routing, and state syncing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div 
              className="p-6 bg-surface-2 border border-border rounded-xl text-left hover:border-primary-bright/35 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-6 text-primary-glow mb-4" />
              <h4 className="text-sm font-semibold text-text-primary mb-2">Android Hilt Client</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Native client architecture built with dependency injection models using Android Hilt modules, ensuring strict dependency lifecycles.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 bg-surface-2 border border-border rounded-xl text-left hover:border-primary-bright/35 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HugeiconsIcon icon={RouteIcon} strokeWidth={2} className="size-6 text-cyan-brand mb-4" />
              <h4 className="text-sm font-semibold text-text-primary mb-2">React Zustand Sync</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Web frontend powered by React, React Router v6 mapping trees, and Zustand global stores syncing session state coordinates.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 bg-surface-2 border border-border rounded-xl text-left hover:border-primary-bright/35 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <HugeiconsIcon icon={SecurityIcon} strokeWidth={2} className="size-6 text-primary-glow mb-4" />
              <h4 className="text-sm font-semibold text-text-primary mb-2">Vector Search API</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Python API endpoints interacting with dense vector database collections to resolve cosine similarity scores.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 11: SECURITY & PERFORMANCE */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-7 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Data Safety
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Platform Security & Latency
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            All profile credentials and portfolio uploads are protected with zero-trust storage. Session handshakes utilize encrypted JWT JSON Web Tokens and expire automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-cyan-brand font-mono">
            <div className="flex items-center gap-2">
              <span>●</span> JWT TOKEN AUTHENTICATION
            </div>
            <div className="flex items-center gap-2">
              <span>●</span> AUTO-RESTORING STORES
            </div>
            <div className="flex items-center gap-2">
              <span>●</span> SECURE ROUTER LOADER GUARDS
            </div>
            <div className="flex items-center gap-2">
              <span>●</span> AES-256 DB ENCRYPTION
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <HudOrbitAnimation />
        </motion.div>
      </section>

      {/* SECTION 12: CTA ORBIT */}
      <section className="px-6 md:px-12 py-24 lg:py-32 relative max-w-6xl mx-auto z-10 text-center">
        {/* Cinematic CTA card wrapper */}
        <motion.div 
          className="relative p-12 md:p-20 bg-gradient-to-br from-primary-dim/30 to-cyan-dim/20 border border-primary-bright/20 rounded-3xl overflow-hidden shadow-[0_12px_64px_rgba(109,40,217,0.15)]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Internal background orb glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/20 rounded blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Badge variant="pro" className="mb-6 animate-pulse">
              INITIALIZE YOUR ACCOUNT
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-text-primary mb-6 leading-tight">
              Command Your Career Orbit Today
            </h2>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg mb-10 leading-relaxed">
              Launch your profile console, identify gaps, and receive RAG expert advice logs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate('/register')} className="w-full sm:w-60 rounded">
                Initialize Orbit Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-60 rounded">
                Log In to Console
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border text-center text-text-tertiary text-xs z-10 relative">
        <p>© 2026 CareerAi. All Rights Reserved.</p>
        <p className="mt-2 text-[10px] text-text-tertiary/60 font-mono">STATION KEY: NAV_V2.0_ORBIT</p>
      </footer>
    </div>
  );
}
