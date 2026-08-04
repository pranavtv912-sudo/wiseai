import React from 'react';
import { motion } from 'framer-motion';

// Import founder image
import founderImage from '../../assets/team/member1.jpg';

export default function About() {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const founderVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white py-24 px-6 md:px-12 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-1/4 w-[450px] h-[450px] bg-purple-500/[0.03] rounded-full filter blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-[#3B82F6]/[0.02] rounded-full filter blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto z-10 flex flex-col items-center">
        
        {/* ====================================================
            FOUNDER SECTION
            ==================================================== */}
        <div className="text-center max-w-3xl mb-12 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#3B82F6]">
            About Us
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Meet the Founder
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium">
            The visionary mind driving ResumeWise AI forward.
          </p>
        </div>

        {/* Premium Founder Card */}
        <motion.div 
          variants={founderVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl relative group my-4"
        >
          {/* Ambient AI Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/30 via-purple-600/30 to-[#3B82F6]/30 rounded-[32px] blur-xl opacity-70 group-hover:opacity-100 transition duration-700 group-hover:duration-300 pointer-events-none animate-pulse"></div>

          {/* Glassmorphism Card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden transition-all duration-500 hover:border-[#3B82F6]/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Top gradient highlight line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent"></div>

            {/* Profile Image Column */}
            <div className="relative flex-shrink-0">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-[3px] bg-gradient-to-tr from-[#3B82F6] via-purple-500 to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.25)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0a]">
                  <img 
                    src={founderImage} 
                    alt="Tiriveedhi Venkata Pranav" 
                    className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              
              {/* Founder Badge floating indicator */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#030303] border border-[#3B82F6]/40 text-[#3B82F6] text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] -ml-3.5"></span>
                <span>Founder</span>
              </div>
            </div>

            {/* Founder Info Column */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 mb-2">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  <span>Leadership & Tech</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Tiriveedhi Venkata Pranav
                </h3>
                <p className="text-[#3B82F6] font-semibold text-base md:text-lg mt-0.5">
                  Founder & AI Engineer <span className="text-gray-500 font-normal">| ResumeWise AI</span>
                </p>
              </div>

              {/* Bio Quote */}
              <div className="relative pl-4 border-l-2 border-[#3B82F6]/40 bg-white/[0.01] py-2 pr-2 rounded-r-xl">
                <p className="text-gray-300 text-sm md:text-base leading-relaxed italic font-sans">
                  "Passionate about building AI-powered solutions that help students and professionals create stronger resumes, improve ATS scores, prepare for interviews, and accelerate their careers. ResumeWise AI is my vision to make career guidance smarter, faster, and accessible to everyone."
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50 transition-all duration-300 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#3B82F6] hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50 transition-all duration-300 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                <a
                  href="mailto:contact@resumewise.ai"
                  aria-label="Email Contact"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xl">
                    mail
                  </span>
                </a>
              </div>

            </div>

          </div>
        </motion.div>

        {/* ====================================================
            EXISTING PREMIUM SECTIONS
            ==================================================== */}
        <div className="w-full mt-24 space-y-20">
          
          {/* Who We Are: Split Layout */}
          <motion.section 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Text Card */}
            <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-12 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#3B82F6] text-3xl p-2 bg-[#3B82F6]/10 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    diversity_3
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
                    Who We Are
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-400 text-sm md:text-base leading-relaxed font-sans">
                  <p>
                    ResumeWise AI is an innovative AI-powered career development platform built to empower students and job seekers in understanding industry expectations, improving their resumes, and preparing for competitive job opportunities.
                  </p>
                  <p>
                    Our platform combines Artificial Intelligence, resume analysis, ATS evaluation, personalized learning roadmaps, and interview preparation tools into a single ecosystem. By leveraging modern technologies and intelligent recommendations, ResumeWise AI empowers users to make informed career decisions and continuously improve their employability.
                  </p>
                  <p>
                    We believe that every individual deserves access to personalized career guidance, regardless of their background or experience level. Through ResumeWise AI, we aim to simplify the journey from learning to employment and help users unlock their full potential.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive/Animated Tech Visual Card */}
            <div className="lg:col-span-5 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent p-8 flex flex-col justify-center items-center relative overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
              
              {/* Spinning tech rings */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-48 h-48 rounded-full border border-dashed border-[#3B82F6]/20"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute w-36 h-36 rounded-full border border-dashed border-[#3B82F6]/35"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-black/60 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                >
                  <span className="material-symbols-outlined text-[#3B82F6] text-4xl animate-pulse">
                    psychology
                  </span>
                </motion.div>
              </div>

              <div className="mt-8 text-center space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Engineered for Growth</div>
                <div className="text-[11px] text-gray-500 font-mono">ResumeWise AI Career Engine v1.0</div>
              </div>
            </div>
          </motion.section>

          {/* Mission & Vision: 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Our Mission */}
            <motion.section
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="p-8 md:p-10 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#3B82F6] text-3xl p-2 bg-[#3B82F6]/10 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    rocket_launch
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                    Our Mission
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-400 text-sm md:text-base leading-relaxed font-sans">
                  <p>
                    Our mission is to bridge the gap between academic learning and industry requirements by providing intelligent, accessible, and personalized career guidance solutions. We strive to help students, graduates, and professionals understand their strengths, identify areas for improvement, and develop the skills necessary to succeed in a rapidly evolving job market.
                  </p>
                  <p>
                    Through AI-driven insights, skill gap analysis, personalized learning recommendations, and interview preparation tools, we aim to transform the way individuals approach career development. Our goal is not only to help users secure jobs but also to support their long-term professional growth and confidence.
                  </p>
                  <p>
                    By making advanced career guidance technology available to everyone, we seek to create a future where opportunities are driven by potential, preparation, and continuous learning.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Our Vision */}
            <motion.section
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="p-8 md:p-10 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#3B82F6] text-3xl p-2 bg-[#3B82F6]/10 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    visibility
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                    Our Vision
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-400 text-sm md:text-base leading-relaxed font-sans">
                  <p>
                    Our vision is to become a leading AI-driven career intelligence platform that transforms how individuals prepare for their professional future. We envision a world where students and professionals can receive personalized career guidance instantly, enabling them to make smarter decisions and achieve their goals more efficiently.
                  </p>
                  <p>
                    We aspire to build a comprehensive ecosystem that integrates resume optimization, skill development, industry insights, interview readiness, and career analytics into one seamless experience. Through continuous innovation and the responsible use of Artificial Intelligence, we aim to help millions of users navigate their career journeys with confidence.
                  </p>
                  <p>
                    Ultimately, our vision is to empower the next generation of talent by providing the tools, knowledge, and guidance needed to thrive in an increasingly competitive and technology-driven world.
                  </p>
                </div>
              </div>
            </motion.section>

          </div>
        </div>

      </div>
    </div>
  );
}


