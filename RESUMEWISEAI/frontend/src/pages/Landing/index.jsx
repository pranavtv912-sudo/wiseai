import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import Aurora from '../../components/Aurora'

export default function Landing() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()

  // Scroll Entry Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    const elements = document.querySelectorAll('.reveal-up')
    elements.forEach(el => observer.observe(el))

    return () => {
      elements.forEach(el => observer.unobserve(el))
    }
  }, [])

  // Magnetic 3D cards hover handler
  const handleCardMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 25
    const rotateY = (centerX - x) / 25
    card.style.transform = `scale(1.015) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
    card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(0,0,0,0.6), 0 0 30px rgba(59, 130, 246, 0.12)`
  }

  const handleCardMouseLeave = (card) => {
    card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg) translateZ(0px)`
    card.style.boxShadow = `none`
  }

  return (
    <div className="flex-1 flex flex-col relative bg-[#030303] text-[#e5e2e1] overflow-x-hidden select-none">
      {/* Aurora Hero Section */}
      <section className="relative w-full min-h-[85vh] lg:min-h-screen flex flex-col justify-center items-center overflow-hidden px-6 text-center z-10 pt-20 pb-16">
        {/* WebGL Aurora Background covering full width behind content */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Aurora
            colorStops={["#3B82F6", "#60A5FA", "#064E3B"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.8}
          />
          {/* Blend overlay to merge with dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/40 to-[#030303]"></div>
        </div>

        {/* Hero Content Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium bg-white/[0.03] border border-white/10 text-[#3B82F6] mb-8 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
            🚀 AI-Powered Career Development Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white max-w-3xl mb-6 font-sans">
            Your AI Career Coach for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-blue-300">
              Resume, Skills & Interviews
            </span>
          </h1>

          {/* Description */}
          <p className="font-sans text-sm md:text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed opacity-90">
            Analyze resumes, improve ATS scores, identify skill gaps, prepare for interviews, and accelerate your career growth through AI-powered insights and personalized learning roadmaps.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={() => {
                if (authenticated) {
                  navigate('/dashboard')
                } else {
                  navigate('/signup')
                }
              }}
              className="group relative bg-[#3B82F6] hover:bg-[#60A5FA] active:scale-[0.97] text-[#00173b] px-9 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(96,165,250,0.4)]"
            >
              Get Started
              <span className="ml-4 w-7 h-7 bg-[#002b1c]/10 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-all duration-500">
                <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
              </span>
            </button>
            
            <button
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.97] text-white px-9 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Learn More
              <span className="ml-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-all duration-500">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-20 relative z-10 px-4">
          {[
            { title: 'AI Resume Analysis', icon: 'analytics', desc: 'Instant deep structural analysis' },
            { title: 'ATS Score Optimization', icon: 'speed', desc: 'Reverse-engineer applicant tracking systems' },
            { title: 'Personalized Learning Roadmaps', icon: 'alt_route', desc: 'Custom pathways to bridge your skill gaps' },
            { title: 'AI Mock Interviews', icon: 'forum', desc: 'Interactive prep with real-time feedback' }
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
              className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md flex flex-col items-center text-center hover:border-[#3B82F6]/25 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(59,130,246,0.06)]"
            >
              <span className="material-symbols-outlined text-[#3B82F6] text-3xl mb-4 p-2 bg-[#3B82F6]/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </span>
              <h3 className="text-white font-bold text-sm mb-2">{card.title}</h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Bento Grid Features */}
      <section id="features-section" className="py-24 md:py-36 px-6 max-w-7xl mx-auto w-full z-10 scroll-mt-24">
        <div className="mb-20 text-center reveal-up">
          <div className="inline-block rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-medium bg-[#6366F1]/10 text-[#6366F1] mb-4">
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold vanguard-heading text-white">Tactical Intelligence</h2>
        </div>
        
        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Card 1: ATS Shadow Simulator (8 Cols) */}
          <div className="md:col-span-8 group reveal-up">
            <div 
              className="p-2 rounded-[2rem] bg-white/[0.02] h-full border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#080808]/90 rounded-[calc(2rem-0.5rem)] p-8 md:p-12 h-full border border-white/5 flex flex-col justify-between backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h4 className="vanguard-heading text-2xl font-bold text-white mb-2">ATS Shadow Simulator</h4>
                    <p className="text-gray-400 text-sm max-w-md font-sans leading-relaxed">Reverse-engineer the invisible algorithms determining your candidacy.</p>
                  </div>
                  <span className="material-symbols-outlined text-[#6366F1] text-3xl">visibility</span>
                </div>
                <div className="mt-8 rounded-2xl overflow-hidden border border-white/5 aspect-[16/6] relative bg-gradient-to-br from-[#6366F1]/5 via-purple-500/[0.02] to-transparent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="material-symbols-outlined text-[#6366F1] text-4xl mb-3 opacity-40">insights</span>
                      <p className="text-gray-500 text-xs font-sans tracking-wide">Upload a resume to initialize real-time simulation matrix</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 2: Skill Gap Intelligence (4 Cols) */}
          <div className="md:col-span-4 group reveal-up delay-100">
            <div 
              className="p-2 rounded-[2rem] bg-white/[0.02] h-full border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#080808]/90 rounded-[calc(2rem-0.5rem)] p-8 md:p-12 h-full border border-white/5 flex flex-col justify-between backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="material-symbols-outlined text-[#6366F1] text-3xl">psychology</span>
                  </div>
                  <h4 className="vanguard-heading text-2xl font-bold text-white mb-2">Skill Gap Intelligence</h4>
                  <p className="text-gray-400 text-sm font-sans leading-relaxed">Identify precise missing nodes in your professional trajectory.</p>
                </div>
                <div className="space-y-4 mt-12">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                      <span>System Architecture</span>
                      <span>85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#6366F1] w-[85%] rounded-full"></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                      <span>Distributed Ledger</span>
                      <span>50%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[50%] rounded-full"></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                      <span>Cognitive Modeling</span>
                      <span>92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#6366F1]/60 w-[92%] rounded-full"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 3: Trajectory Mapper (5 Cols) */}
          <div className="md:col-span-5 group reveal-up">
            <div 
              className="p-2 rounded-[2rem] bg-white/[0.02] h-full border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#080808]/90 rounded-[calc(2rem-0.5rem)] p-8 md:p-12 h-full border border-white/5 flex flex-col justify-between backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="material-symbols-outlined text-[#6366F1] text-3xl">alt_route</span>
                  </div>
                  <h4 className="vanguard-heading text-2xl font-bold text-white mb-2">Trajectory Mapper</h4>
                  <p className="text-gray-400 text-sm font-sans leading-relaxed mb-6">Visualizing 10,000+ career evolution paths for your specific profile.</p>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs font-mono text-gray-500">
                  ⚡ VECTOR PATHWAY ACTIVE
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 4: Precision Roadmap (7 Cols) */}
          <div className="md:col-span-7 group reveal-up delay-100">
            <div 
              className="p-2 rounded-[2rem] bg-white/[0.02] h-full border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#080808]/90 rounded-[calc(2rem-0.5rem)] p-8 md:p-12 h-full border border-white/5 flex flex-col md:flex-row gap-8 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="vanguard-heading text-2xl font-bold text-white mb-2">Precision Roadmap</h4>
                    <p className="text-gray-400 text-sm font-sans leading-relaxed">A step-by-step tactical execution plan generated in milliseconds.</p>
                  </div>
                  <ul className="mt-8 space-y-3.5">
                    <li className="flex items-center gap-3 text-xs tracking-wide text-[#6366F1] font-sans font-medium">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Keyword Optimization
                    </li>
                    <li className="flex items-center gap-3 text-xs tracking-wide text-gray-400 font-sans">
                      <span className="material-symbols-outlined text-[16px]">pending</span>
                      Certification Acquisition
                    </li>
                  </ul>
                </div>
                <div className="flex-1 min-h-[150px] bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="text-center text-[10px] text-gray-500 font-mono tracking-widest">
                    [ROADMAP CANVAS MINIMIZED]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-44 relative overflow-hidden w-full z-10 reveal-up">
        <div className="absolute inset-0 bg-gradient-to-t from-[#6366F1]/5 via-purple-500/[0.02] to-transparent blur-[120px] rounded-full scale-125 translate-y-1/3 pointer-events-none"></div>
        <div className="px-6 max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 vanguard-heading text-white">Architect Your Future.</h2>
          <p className="font-sans text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed">
            Join the top 1% of candidates who leverage precision engineering to bypass the noise and land elite opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button 
              onClick={() => {
                if (authenticated) {
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                } else {
                  navigate('/signup')
                }
              }}
              className="group bg-[#6366F1] hover:bg-[#5affb8] active:scale-[0.97] text-[#00173b] px-9 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              COMMENCE ANALYSIS
              <span className="ml-4 w-7 h-7 bg-[#002b1c]/10 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-all duration-500">
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              </span>
            </button>
            <Link to="/roadmap" className="group bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.97] text-white px-9 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              VIEW METHODOLOGY
              <span className="ml-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-all duration-500">
                <span className="material-symbols-outlined text-[16px]">auto_graph</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-20 border-t border-white/5 relative z-10 bg-[#070707] reveal-up">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="vanguard-heading text-2xl font-bold text-white mb-2">ResumeWise AI</div>
            <p className="text-gray-500 text-[11px] font-sans tracking-wide">© 2024 ResumeWise AI. Precision Career Engineering.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <a className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-300" href="#">Privacy Policy</a>
            <a className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-300" href="#">Terms of Service</a>
            <Link className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-300" to="/about">About Us</Link>
            <Link className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-300" to="/resources">Resources</Link>
            <a className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-300" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

