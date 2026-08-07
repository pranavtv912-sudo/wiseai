import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'

export default function Landing() {
  const { authenticated } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Simulate parsing animation for floating resume card
  useEffect(() => {
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev >= 100 ? 0 : prev + 10))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Generate 25 subtle floating particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.2
  }))

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
  }

  const stagger = {
    visible: { transition: { staggerChildren: 0.14 } }
  }

  return (
    <div className="min-h-screen bg-[#030508] text-[#F5F7FA] font-['Inter',sans-serif] selection:bg-[#4D7CFF]/30 selection:text-white overflow-x-hidden relative">
      
      {/* 6. BACKGROUND VIDEO + REFINED VIGNETTE (brightness .58, contrast 1.08, saturate 1.08) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <video
          className="w-full h-full object-cover filter brightness-[0.58] contrast-[1.08] saturate-[1.08] will-change-transform"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-in-a-lab-41584-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Soft Vignette + Top/Bottom Gradients */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `
              radial-gradient(120% 100% at 50% 42%, transparent 40%, rgba(4, 7, 12, 0.4) 100%),
              linear-gradient(180deg, rgba(3, 5, 8, 0.35) 0%, transparent 20%, transparent 78%, #030508 100%)
            `
          }}
        />

        {/* Subtle Blue Radial Glow Behind Headline */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: 'min(1100px, 85vw)',
            height: 'min(480px, 55vh)',
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(77, 124, 255, 0.14), transparent 75%)',
            filter: 'blur(70px)'
          }}
        />

        {/* 15. BACKGROUND PARTICLES */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#4D7CFF] pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 4}px #4D7CFF`
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [p.opacity, p.opacity * 1.8, p.opacity]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10">

        {/* 1. HERO SECTION (Height ~85vh, Vertically Centered) */}
        <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative">
          
          {/* 5. FLOATING LEFT CARD (Shifted slightly toward center, 8s loop, 1 deg rotation) */}
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotate: [-1, 1, -1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="hidden xl:flex absolute left-14 top-1/2 -translate-y-1/2 flex-col gap-3 w-64 p-5 rounded-2xl bg-[#080C14]/75 backdrop-blur-2xl border border-white/10 shadow-2xl text-left will-change-transform z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4D7CFF]/20 flex items-center justify-center text-[#4D7CFF] text-xs font-mono">
                PDF
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">resume_senior.pdf</p>
                <p className="text-[10px] text-white/50">2.4 MB · Uploading...</p>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4D7CFF] h-full transition-all duration-300 shadow-[0_0_8px_#4D7CFF]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-white/60">
              <p className={uploadProgress > 20 ? 'text-[#4DEB92]' : ''}>✓ Parsing Structure...</p>
              <p className={uploadProgress > 50 ? 'text-[#4DEB92]' : ''}>✓ Extracting Skills...</p>
              <p className={uploadProgress > 80 ? 'text-[#4DEB92]' : ''}>✓ Evaluating ATS Score...</p>
            </div>
          </motion.div>

          {/* 5. FLOATING RIGHT CARD (Shifted slightly toward center, 8s loop, -1 deg rotation) */}
          <motion.div
            animate={{
              y: [8, -8, 8],
              rotate: [1, -1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="hidden xl:flex absolute right-14 top-1/2 -translate-y-1/2 flex-col gap-4 w-72 p-6 rounded-3xl bg-[#080C14]/75 backdrop-blur-2xl border border-white/10 shadow-2xl text-left will-change-transform z-20"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase">LIVE INTELLIGENCE</span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4DEB92]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4DEB92] animate-ping" />
                96% MATCH
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold font-['Manrope'] text-white">96</p>
                <p className="text-[10px] text-white/50 font-mono">ATS Score</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold font-['Manrope'] text-[#4DEB92]">94%</p>
                <p className="text-[10px] text-white/50 font-mono">Industry Match</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold font-['Manrope'] text-[#4D7CFF]">Ex</p>
                <p className="text-[10px] text-white/50 font-mono">Quality</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold font-['Manrope'] text-white">97%</p>
                <p className="text-[10px] text-white/50 font-mono">Confidence</p>
              </div>
            </div>
          </motion.div>

          {/* HERO CENTER CONTENT */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto flex flex-col items-center justify-center my-auto"
          >
            {/* EYEBROW */}
            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#4D7CFF]/30 backdrop-blur-md mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#4D7CFF] shadow-[0_0_10px_#4D7CFF] animate-pulse" />
              <span className="font-mono text-xs tracking-[0.25em] text-[#4D7CFF] uppercase">
                Career Intelligence Platform v2.0
              </span>
            </motion.div>

            {/* 2. HEADLINE (clamp 72px..155px, line-height 0.9, letter-spacing -0.05em) */}
            <motion.h1
              variants={fadeIn}
              transition={{ duration: 1 }}
              className="font-['Manrope',sans-serif] font-extrabold text-[clamp(60px,10vw,145px)] leading-[0.9] tracking-[-0.05em] text-white mb-6"
            >
              Build careers.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7097FF] via-[#4D7CFF] to-[#3562E0] filter drop-shadow-[0_0_40px_rgba(77,124,255,0.4)]">
                Not resumes.
              </span>
            </motion.h1>

            {/* 3. SUBTITLE (max-w 700px, 18px font, line-height 1.7, 55% opacity) */}
            <motion.p
              variants={fadeIn}
              transition={{ duration: 1 }}
              className="text-[18px] text-white/55 font-light max-w-[700px] leading-[1.7] mb-8"
            >
              ResumeWise AI transforms ordinary resumes into interview-winning career assets using advanced Artificial Intelligence.
            </motion.p>

            {/* 4. CTA SECTION */}
            <motion.div
              variants={fadeIn}
              transition={{ duration: 1 }}
              className="flex items-center gap-7"
            >
              <Link
                to={authenticated ? '/upload' : '/signup'}
                className="px-9 py-4 rounded-full bg-gradient-to-r from-[#4D7CFF] to-[#3562E0] border border-[#7097FF]/50 backdrop-blur-md text-white font-semibold text-base shadow-[0_8px_30px_rgba(77,124,255,0.35)] hover:shadow-[0_12px_40px_rgba(77,124,255,0.6)] hover:-translate-y-[3px] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 group will-change-transform"
              >
                Analyze My Resume →
              </Link>
              <a
                href="#features"
                className="px-6 py-4 text-white/70 hover:text-white font-medium text-base relative group transition-colors"
              >
                Watch Demo
                <span className="absolute bottom-3 left-6 right-6 h-[1px] bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* 8. TRUST BAR WITH ANIMATED COUNTER DISPLAY */}
        <section className="py-14 border-y border-white/5 bg-[#030508]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="font-mono text-xs text-white/40 tracking-[0.2em] uppercase mb-8">
              TRUSTED BY OVER 10,000+ CANDIDATES & PROFESSIONALS
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 font-['Manrope'] font-bold text-lg text-white">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4D7CFF]"></span> 10,000+ Students</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4DEB92]"></span> Fresh Graduates</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#7097FF]"></span> Software Engineers</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3562E0]"></span> Career Switchers</span>
            </div>
          </div>
        </section>

        {/* 9. DASHBOARD PREVIEW PANEL */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="p-6 md:p-10 rounded-[36px] bg-[#080C14]/80 border border-white/15 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-white/40">app.resumewise.ai/dashboard</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-['Manrope'] font-bold text-xl text-white">ATS Performance Dashboard</h4>
                  <span className="text-xs font-mono text-[#4DEB92]">Score: 96%</span>
                </div>
                <div className="h-56 w-full bg-[#4D7CFF]/5 rounded-xl border border-[#4D7CFF]/20 flex flex-col items-center justify-center font-mono text-sm text-[#4D7CFF] gap-2">
                  <span>[ Real-Time Resume & JD Analytics Engine ]</span>
                  <span className="text-xs text-white/40">Analyzing keywords, formatting, & structural metrics</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <h4 className="font-['Manrope'] font-bold text-xl text-white">Actionable Insights</h4>
                <div className="p-3 rounded-lg bg-white/5 text-xs text-white/80">✓ Add 'Docker & Kubernetes' to technical skills</div>
                <div className="p-3 rounded-lg bg-white/5 text-xs text-white/80">✓ Quantify achievement metrics (+45%)</div>
                <div className="p-3 rounded-lg bg-white/5 text-xs text-white/80">✓ Align summary for Senior Full-Stack role</div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. AI FEATURES GRID */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-['Manrope'] font-bold text-4xl md:text-6xl text-white mb-6">
              Autonomous Career Intelligence.
            </h2>
            <p className="text-white/60 text-lg">
              Six foundational AI capabilities designed to give freshers and engineers an unfair advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'ATS Score Optimizer',
                desc: 'Real-time structural & keyword scoring engine matching enterprise recruiter filters.',
                icon: '⚡'
              },
              {
                title: 'Skill Gap Detector',
                desc: 'Identifies missing technical proficiencies and maps exact learning pathways.',
                icon: '🎯'
              },
              {
                title: 'Job Description Matcher',
                desc: 'Compares your resume against specific target JDs with contextual relevancy scoring.',
                icon: '📊'
              },
              {
                title: 'AI Interview Prep',
                desc: 'Generates tailored technical and behavioral questions based on your actual resume.',
                icon: '🤖'
              },
              {
                title: 'Smart Resume Builder',
                desc: 'Auto-formats ATS-compliant templates tuned for modern tech hiring standards.',
                icon: '📝'
              },
              {
                title: 'Career Roadmap Generator',
                desc: 'Synthesizes step-by-step milestones to help you land your target role fast.',
                icon: '🚀'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-[#080C14]/50 border border-white/10 hover:border-[#4D7CFF]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-['Manrope'] font-semibold text-2xl text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 11. CAREER JOURNEY TIMELINE */}
        <section className="py-32 px-6 max-w-5xl mx-auto text-center">
          <h2 className="font-['Manrope'] font-bold text-4xl md:text-5xl text-white mb-20">
            From Upload to Hired.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['Upload Resume', 'AI Analysis', 'Skill Gap Detection', 'Learning Roadmap', 'Interview Prep', 'Get Hired'].map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#080C14]/60 border border-white/10 flex flex-col items-center gap-2">
                <span className="font-mono text-xs text-[#4D7CFF]">0{idx + 1}</span>
                <span className="font-semibold text-xs md:text-sm text-white">{step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 12. ANIMATED STATS */}
        <section className="py-24 border-y border-white/5 bg-[#080C14]/40">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { num: '120K+', label: 'Resumes Analyzed' },
              { num: '96%', label: 'Average ATS Score' },
              { num: '500K+', label: 'Interview Queries' },
              { num: '98%', label: 'Success Rate' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-['Manrope'] font-extrabold text-4xl md:text-6xl text-white mb-2">{stat.num}</p>
                <p className="text-white/50 text-sm font-mono">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 13. TESTIMONIALS */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-['Manrope'] font-bold text-4xl text-white mb-4">
              Loved by Engineers & Graduates
            </h2>
            <p className="text-white/60 text-base">Here is how ResumeWise AI accelerates real careers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "ResumeWise boosted my ATS score from 54 to 92. I landed my Python Developer interview within 2 weeks!", name: "Alex R.", role: "Junior Developer" },
              { quote: "The skill gap analyzer showed me exactly what Docker & SQL concepts I was missing.", name: "Priya M.", role: "CS Graduate" },
              { quote: "The AI interview prep generated questions identical to what I was asked in my technical loop.", name: "David K.", role: "Software Engineer" }
            ].map((t, ti) => (
              <div key={ti} className="p-8 rounded-3xl bg-[#080C14]/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-[#4D7CFF] font-mono">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14. FAQ */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <h2 className="font-['Manrope'] font-bold text-3xl md:text-4xl text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { q: 'How does the ATS score calculation work?', a: 'ResumeWise AI uses real recruiting algorithms to benchmark your resume against industry standards.' },
              { q: 'Is my uploaded resume kept private?', a: 'Yes, your document privacy and data security are strictly protected.' },
              { q: 'Can I target specific job roles?', a: 'Absolutely. You can select from dozens of tech and engineering roles or paste custom job descriptions.' }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#080C14]/50 border border-white/10 cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{faq.q}</span>
                  <span>{openFaq === idx ? '-' : '+'}</span>
                </div>
                {openFaq === idx && <p className="mt-4 text-sm text-white/60 leading-relaxed">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-white/10 text-center text-xs text-white/40 font-mono">
          <p>© 2026 ResumeWise AI · Career Intelligence Platform. All rights reserved.</p>
        </footer>

      </div>
    </div>
  )
}
