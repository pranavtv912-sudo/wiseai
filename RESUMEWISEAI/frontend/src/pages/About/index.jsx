import React from 'react';
import { motion } from 'framer-motion';
import InfiniteMenu from '../../components/InfiniteMenu';

// Import team member images
import member1 from '../../assets/team/member1.jpg';
import member2 from '../../assets/team/member2.jpg';
import member3 from '../../assets/team/member3.jpg';
import member4 from '../../assets/team/member4.jpg';
import member5 from '../../assets/team/member5.jpg';
import member6 from '../../assets/team/member6.jpg';
import member7 from '../../assets/team/member7.jpg';
import member8 from '../../assets/team/member8.jpg';

export default function About() {
  const items = [
    {
      image: member1,
      link: '',
      title: 'T. Venkata Pranav',
      description: 'Frontend Developer, Backend Developer & API Integration'
    },
    {
      image: member2,
      link: '',
      title: 'B. Sai Teja',
      description: 'Team Leader, Frontend Developer, Backend Developer & Database Management'
    },
    {
      image: member3,
      link: '',
      title: 'D. Shashinath Yadav',
      description: 'Database Management & API Integration'
    },
    {
      image: member4,
      link: '',
      title: 'P. Akhilesh',
      description: 'Frontend Developer & Backend Developer'
    },
    {
      image: member5,
      link: '',
      title: 'Skanda',
      description: 'UI/UX Designer & Frontend Developer'
    },
    {
      image: member6,
      link: '',
      title: 'K. Yashwanth',
      description: 'Backend Developer'
    },
    {
      image: member7,
      link: '',
      title: 'Ashish Yadav',
      description: 'UI/UX Designer'
    },
    {
      image: member8,
      link: '',
      title: 'Chandra Siddartha',
      description: 'Backend Developer'
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white py-24 px-6 md:px-12 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-1/4 w-96 h-96 bg-purple-500/[0.02] rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-[#3B82F6]/[0.02] rounded-full filter blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto z-10 flex flex-col items-center">
        
        {/* ====================================================
            TEAM SECTION (EXISTING)
            ==================================================== */}
        <div className="text-center max-w-3xl mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#3B82F6]">
            About Us
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Meet Our Team
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium">
            The passionate minds behind ResumeWise AI.
          </p>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto pt-2 font-sans">
            Our team of 8 members collaborated to build ResumeWise AI, an AI-powered career development platform that helps students improve resumes, identify skill gaps, prepare for interviews, and achieve career success.
          </p>
        </div>

        {/* WebGL Infinite Menu Container */}
        <div className="w-full relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent"></div>
          
          <div className="team-menu-container w-full h-[600px] md:h-[650px] relative">
            <InfiniteMenu items={items} scale={1.1} />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 tracking-wider font-mono">
          DRAG OR SPIN THE SPHERE TO NAVIGATE MEMBERS
        </div>

        {/* ====================================================
            NEW PREMIUM SECTIONS
            ==================================================== */}
        <div className="w-full mt-32 space-y-20">
          
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
                    ResumeWise AI is an innovative AI-powered career development platform built by a dedicated team of students passionate about technology, artificial intelligence, and professional growth. We recognized the challenges faced by students and job seekers in understanding industry expectations, improving their resumes, and preparing for competitive job opportunities.
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

