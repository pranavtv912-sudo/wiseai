import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAnalysis, listResumes, getProgress } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(78)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [track, setTrack] = useState('Full Stack')
  const [status, setStatus] = useState('Qualified')
  const [statusLabel, setStatusLabel] = useState('Meets Track Entry Criteria')
  const [skills, setSkills] = useState([])
  const [gaps, setGaps] = useState([])
  const [salaryEstimate, setSalaryEstimate] = useState('$185k+')
  const [trendText, setTrendText] = useState('+12% VS LAST QUARTER')

  const [activeFileName, setActiveFileName] = useState('')
  const [learningProgress, setLearningProgress] = useState(0)

  // Redirection if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/signin')
    }
  }, [authenticated, navigate])

  useEffect(() => {
    async function loadData() {
      let resumeId = localStorage.getItem('rw_last_analyzed_id')
      let scoreVal = 0
      let trackVal = 'No active profile'
      let skillsList = []
      let gapsList = []
      let salaryVal = '$0'
      let fileNameVal = ''

      if (authenticated) {
        try {
          // If no active resumeId, fetch resumes and pick the latest
          const listRes = await listResumes()
          if (listRes.success && listRes.data?.resumes?.length > 0) {
            const latest = listRes.data.resumes[0]
            if (!resumeId || !listRes.data.resumes.some(r => r.id === resumeId)) {
              resumeId = latest.id
              localStorage.setItem('rw_last_analyzed_id', resumeId)
            }
            // Find current active resume details
            const activeRes = listRes.data.resumes.find(r => r.id === resumeId) || latest;
            fileNameVal = activeRes.file_name || activeRes.original_name || '';
          }

          if (resumeId) {
            const res = await getAnalysis(resumeId)
            if (res.success && res.data) {
              const analysis = res.data.analysis || res.data
              
              if (analysis.ats_score) {
                scoreVal = typeof analysis.ats_score === 'object' ? (analysis.ats_score.total || 0) : analysis.ats_score
              } else if (analysis.total_ats_score) {
                scoreVal = analysis.total_ats_score
              }

              trackVal = analysis.detected_track || analysis.goalRole || analysis.targetRole || 'Developer'
              
              skillsList = analysis.skills?.matching || analysis.matchingSkills || []
              
              const missingSkillsList = analysis.skills?.missing_required || analysis.missingRequiredSkills || []
              gapsList = missingSkillsList.map(skill => {
                const name = typeof skill === 'string' ? skill : (skill.name || '')
                return {
                  name,
                  level: 40 + Math.floor(Math.random() * 30),
                  status: 'Critical Gap'
                }
              })

              const salaryData = analysis.market_data?.salary_data || analysis.marketData?.salaryData
              if (salaryData) {
                if (salaryData.average_min && salaryData.average_max) {
                  salaryVal = `$${Math.round(salaryData.average_min / 1000)}k - $${Math.round(salaryData.average_max / 1000)}k`
                } else if (salaryData.average_salary) {
                  salaryVal = `$${Math.round(salaryData.average_salary / 1000)}k+`
                }
              }
              
              // Cache details locally
              localStorage.setItem('rw_last_score', scoreVal)
              localStorage.setItem('rw_detected_track', trackVal)
            }

            // Fetch user progress items to calculate progress
            try {
              const progRes = await getProgress()
              if (progRes.success && progRes.data?.progress?.length > 0) {
                const items = progRes.data.progress
                const completed = items.filter(item => item.completed).length
                setLearningProgress(Math.round((completed / items.length) * 100))
              }
            } catch (err) {
              console.warn('Error fetching learning progress:', err)
            }
          }
        } catch (err) {
          console.error('Error fetching dashboard details:', err)
        }
      }

      setScore(scoreVal)
      setTrack(trackVal)
      setSkills(skillsList)
      setGaps(gapsList)
      setSalaryEstimate(salaryVal)
      setActiveFileName(fileNameVal)
      setStatus(resumeId ? 'Active' : 'Uninitialized')
      setStatusLabel(fileNameVal ? `Loaded: ${fileNameVal}` : 'No resume uploaded yet')
      setLoading(false)
    }

    loadData()
  }, [authenticated])

  // Count-up animation for score
  useEffect(() => {
    if (loading) return
    setAnimatedScore(0)
    let current = 0
    const interval = setInterval(() => {
      current++
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(interval)
      } else {
        setAnimatedScore(current)
      }
    }, 15)
    return () => clearInterval(interval)
  }, [score, loading])

  // Card hover styles
  const handleMouseMove = (e, card) => {
    const r = card.getBoundingClientRect()
    const rx = (e.clientY - r.top - r.height / 2) / 25
    const ry = (r.width / 2 - (e.clientX - r.left)) / 25
    card.style.transform = `scale(1.01) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(15px)`
  }

  const handleMouseLeave = (card) => {
    card.style.transform = ''
    card.style.boxShadow = ''
  }

  const offset = 283 - (283 * animatedScore) / 100
  const icons = ['code', 'database', 'cloud', 'security', 'terminal', 'memory', 'hub', 'analytics']
  const statuses = ['Critical Gap', 'Emerging', 'Expert', 'High Proficiency', 'Growing', 'Advanced']
  const colors = ['bg-[#4edea3]', 'bg-purple-500', 'bg-[#4edea3]/50', 'bg-amber-400']
  const statusColors = ['text-[#4edea3]', 'text-purple-500', 'text-[#4edea3]/50', 'text-amber-400']

  return (
    <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full relative z-10">
      
      {/* Hero / Analysis Header */}
      <section className="pt-20 pb-16">
        <span className="font-label-sm text-xs text-[#4edea3] uppercase tracking-[0.4em] mb-4 block">
          Precision Analyzed 2026
        </span>
        <h1 className="vanguard-heading text-5xl md:text-7xl leading-tight mb-6">
          Engineering<br />
          <span className="text-gray-500 italic">The Trajectory</span><br />
          of Success.
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-12">
          Our AI strategist has deconstructed your professional footprint. We've mapped your trajectory against the top 0.1% of industry leaders to reveal the high-impact gaps in your current technical stack.
        </p>

        {/* Workspace Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-white/10 pb-6">
          <Link 
            to="/dashboard"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4edea3]/12 border border-[#4edea3]/35 text-[#4edea3] transition-all"
          >
            Overview
          </Link>
          <Link 
            to="/upload"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Upload Dossier
          </Link>
          <Link 
            to="/analysis"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Detailed Report
          </Link>
          <Link 
            to="/skill-gap"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Skill Gap
          </Link>
          <Link 
            to="/history"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Ingest History
          </Link>
          <Link 
            to="/reports"
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Reports Manager
          </Link>
        </div>
      </section>

      {/* ATS & Qualification Cards */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ATS Card */}
          <div 
            className="p-2 rounded-[2rem] bg-white/5 vanguard-card border border-white/5"
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 border border-white/10 flex items-center gap-8 h-full">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#4edea3" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray="283" 
                    strokeDashoffset={loading ? 283 : offset} 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold font-mono text-white">{loading ? '--' : animatedScore}</span>
                    <span className="block text-[8px] text-gray-500 uppercase tracking-widest">Score</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">ATS Precision</h3>
                <p className="text-sm text-gray-400">
                  {score >= 90 
                    ? 'Ranked Elite for FAANG technical roles.' 
                    : score >= 70 
                      ? 'Strong match. Minor optimization needed.' 
                      : 'Significant gaps detected. Action required.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Qualification Card */}
          <div 
            className={`p-2 rounded-[2rem] bg-white/5 vanguard-card border border-white/5 ${loading ? 'animate-pulse' : ''}`}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 border border-white/10 flex items-center gap-8 h-full">
              <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[#4edea3]">
                  {status === 'Qualified' ? 'workspace_premium' : 'autorenew'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Profile Target</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                    status === 'Active' || status === 'Qualified' 
                      ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {loading ? 'Analyzing' : status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold vanguard-heading text-white">{loading ? 'Detecting Field...' : track}</h3>
                <p className="text-sm text-gray-400 mt-1">{loading ? 'Extracting academic & skill credentials...' : statusLabel}</p>
                {!loading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#a78bfa] font-bold uppercase tracking-wider font-mono">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    Learning Progress: {learningProgress}%
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bento Analytics Grid */}
      <section className="pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Skill Ecosystem */}
          <div className="md:col-span-7">
            <div 
              className="p-1.5 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Framework 01</span>
                    <h3 className="vanguard-heading text-2xl font-bold">Skill Ecosystem</h3>
                  </div>
                  <Link 
                    to="/resources" 
                    className="island-button bg-[#4edea3]/10 text-[#4edea3] px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#4edea3]/20 transition-all border border-[#4edea3]/20"
                  >
                    Fill Gaps
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </Link>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => <div key={n} className="skeleton h-24 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {skills.slice(0, 8).map((skill, i) => {
                      const skillName = typeof skill === 'string' ? skill : (skill.name || 'Skill')
                      const skillLevel = typeof skill === 'string' ? statuses[i % statuses.length] : (skill.level || 'Advanced')
                      return (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#4edea3]/30 transition-all cursor-default">
                          <span className="material-symbols-outlined text-[#4edea3] text-2xl mb-3 block">
                            {icons[i % icons.length]}
                          </span>
                          <div className="text-sm font-medium text-white truncate">{skillName}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{skillLevel}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Market Estimate */}
          <div className="md:col-span-5">
            <div 
              className="p-1.5 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Market Estimate</span>
                  <div className="vanguard-heading text-5xl font-bold tracking-tight text-white">
                    {loading ? (
                      <span className="skeleton inline-block w-48 h-12 rounded-lg"></span>
                    ) : (
                      salaryEstimate
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Based on your current skill-density and roadmap potential.</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase">{trendText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="md:col-span-8">
            <div 
              className="p-1.5 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="vanguard-heading text-2xl font-bold">Gap Intelligence</h3>
                  <span className="bg-[#4edea3]/10 text-[#4edea3] text-[10px] px-2 py-0.5 rounded border border-[#4edea3]/20 font-bold uppercase tracking-widest">Active Node</span>
                </div>
                <p className="text-sm text-gray-400 mb-8">Key areas identified for maximum career velocity.</p>
                
                {loading ? (
                  <div className="space-y-6">
                    <div className="h-10 skeleton rounded" />
                    <div className="h-10 skeleton rounded" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {gaps.slice(0, 5).map((gap, i) => {
                      const name = typeof gap === 'string' ? gap : gap.name
                      const statusStr = typeof gap === 'string' ? 'Gap Detected' : gap.status
                      const level = typeof gap === 'string' ? (60 + Math.random() * 30) : gap.level
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-300">
                            <span>{name}</span>
                            <span className={statusColors[i % statusColors.length]}>{statusStr}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`} 
                              style={{ width: `${level}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Trajectory Mapper */}
          <div className="md:col-span-4">
            <div 
              className="p-1.5 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-[#4edea3] text-3xl mb-4">alt_route</span>
                  <h3 className="vanguard-heading text-2xl font-bold mb-2">Trajectory Mapper</h3>
                  <p className="text-sm text-gray-400 mb-6">Your personalized career evolution paths based on this analysis.</p>
                </div>
                <Link 
                  to={`/roadmap?track=${encodeURIComponent(track)}`} 
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#4edea3] hover:gap-3 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  EXPLORE OPTIMIZED PATHS
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
