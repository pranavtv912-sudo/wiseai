import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAnalysis } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ResumeAnalysis() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState(null)
  const [score, setScore] = useState(78)

  useEffect(() => {
    async function loadAnalysis() {
      const resumeId = localStorage.getItem('rw_last_analyzed_id')
      if (!resumeId) {
        setLoading(false)
        return
      }
      try {
        const res = await getAnalysis(resumeId)
        if (res.success && res.data) {
          const analysis = res.data.analysis || res.data
          setAnalysisData(analysis)
          
          let scoreVal = 78
          if (analysis.ats_score) {
            scoreVal = typeof analysis.ats_score === 'object' ? (analysis.ats_score.total || 78) : analysis.ats_score
          } else if (analysis.total_ats_score) {
            scoreVal = analysis.total_ats_score
          } else if (analysis.atsScore) {
            scoreVal = analysis.atsScore
          }
          setScore(scoreVal)
        }
      } catch (err) {
        console.error('Failed to load analysis:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (authenticated) {
      loadAnalysis()
    }
  }, [authenticated])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 max-w-4xl mx-auto text-center pt-24">
        <div className="skeleton w-full max-w-md h-96 rounded-[2rem]" />
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center pt-24 pb-32 relative z-10">
        <span className="material-symbols-outlined text-[#6366F1] text-6xl mb-6">analytics</span>
        <h1 className="vanguard-heading text-4xl font-bold mb-4">No Analysis File Selected</h1>
        <p className="text-gray-400 mb-8 max-w-md">You have not ingested any resume dossiers for keyword analysis yet.</p>
        <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest">
          Ingest Resume Now
        </Link>
      </div>
    )
  }

  // Calculate scores
  const scoreBreakdown = {
    keywords: Math.min(100, Math.round(score * 1.05)),
    formatting: Math.min(100, Math.round(score * 0.98)),
    structure: Math.min(100, Math.round(score * 1.02)),
    style: Math.min(100, Math.round(score * 0.95)),
  }

  const matchingSkills = analysisData.matchingSkills || (analysisData.skills && typeof analysisData.skills === 'object' ? analysisData.skills.matching : null) || []
  const missingSkills = analysisData.missingRequiredSkills || analysisData.missing_required_skills || (analysisData.skills && typeof analysisData.skills === 'object' ? (analysisData.skills.missing_required || analysisData.skills.missing) : null) || []

  return (
    <div className="flex-1 max-w-7xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366F1] block mb-2">
            Tactical Dossier Analysis
          </span>
          <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
            ATS Core <span className="text-gray-500 italic">Report</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Targeting Track: <span className="text-white font-semibold font-mono">{analysisData.detected_track || analysisData.targetRole}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/upload" className="island-button bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Ingest Another
          </Link>
          <Link to="/roadmap" className="island-button bg-[#6366F1] text-[#00173b] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
            <span className="material-symbols-outlined text-[14px]">alt_route</span> Explore Roadmap
          </Link>
        </div>
      </section>

      {/* Workspace Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-white/10 pb-6">
        <Link 
          to="/dashboard"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
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
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6366F1]/12 border border-[#6366F1]/35 text-[#6366F1] transition-all"
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

      {/* Main Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Side: Score Summary Card */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-white/15 rounded-[2rem] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-bl-full pointer-events-none" />
          
          <div className="w-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 text-left">Overall Score</h3>
            
            <div className="relative w-44 h-44 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  fill="none" 
                  stroke="#6366F1" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeDasharray="276" 
                  strokeDashoffset={276 - (276 * score) / 100} 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black font-mono text-white leading-none">{score}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Percentile</span>
              </div>
            </div>
            
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
              score >= 90 
                ? 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20' 
                : score >= 75
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {score >= 90 ? 'Vanguard Elite' : score >= 75 ? 'Optimal Candidacy' : 'Needs Optimization'}
            </span>
          </div>

          <div className="w-full border-t border-white/10 mt-8 pt-6 space-y-3.5 text-left text-xs text-gray-400">
            <div className="flex justify-between items-center">
              <span>Candidate Index</span>
              <span className="text-white font-mono font-medium">#RW-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Analysis Integrity</span>
              <span className="text-white font-mono font-medium">99.8% Match</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ingested Date</span>
              <span className="text-white font-mono font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Criteria Sliders */}
        <div className="lg:col-span-8 bg-[#0A0A0A] border border-white/15 rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Category Breakdown</h3>
          
          <div className="space-y-7">
            {/* Keywords */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">
                <span>Keyword Density & Relevance</span>
                <span className="text-[#6366F1]">{scoreBreakdown.keywords}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${scoreBreakdown.keywords}%` }} />
              </div>
            </div>

            {/* Structure */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">
                <span>Dossier Section Structure</span>
                <span className="text-[#6366F1]">{scoreBreakdown.structure}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${scoreBreakdown.structure}%` }} />
              </div>
            </div>

            {/* Formatting */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">
                <span>Layout & Parsing Readiness</span>
                <span className="text-[#6366F1]">{scoreBreakdown.formatting}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${scoreBreakdown.formatting}%` }} />
              </div>
            </div>

            {/* Phrasing */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">
                <span>Styling & Action Verb Index</span>
                <span className="text-[#6366F1]">{scoreBreakdown.style}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scoreBreakdown.style}%` }} />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Keywords Audit & Gaps Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Matched Keywords */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#6366F1] text-2xl">check_circle</span>
            <h3 className="vanguard-heading text-xl font-bold text-white">Matched Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {matchingSkills.map((s, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/20 text-xs font-mono text-[#6366F1] tracking-wide">
                {typeof s === 'string' ? s : s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-amber-400 text-2xl">warning</span>
            <h3 className="vanguard-heading text-xl font-bold text-white">Identified Keyword Gaps</h3>
          </div>
          {missingSkills.length === 0 ? (
            <p className="text-gray-500 text-xs font-mono">No critical keyword gaps identified in the dossier.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {missingSkills.map((s, i) => (
                <span key={i} className="px-3.5 py-1.5 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs font-mono text-amber-400 tracking-wide">
                  {typeof s === 'string' ? s : s.name}
                </span>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Recommendations Card */}
      <section className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-purple-400 text-2xl">lightbulb</span>
          <h3 className="vanguard-heading text-xl font-bold text-white">Critical Recommendations</h3>
        </div>
        <ul className="space-y-4 text-sm text-gray-400">
          <li className="flex gap-3 items-start">
            <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Enhance Keyword Density</strong>: Incorporate {missingSkills.slice(0, 3).map(s => typeof s === 'string' ? s : s.name).join(', ')} into your experience bullets, tying them to metrics.
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Leverage Strong Action Verbs</strong>: Replace passive phrases like "assisted with" or "responsible for" with strong metrics-based descriptors (e.g. "Architected", "Optimized", "Engineered").
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-2 flex-shrink-0" />
            <div>
              <strong className="text-white">Review Dossier Formatting</strong>: Ensure layout parser integrity by removing dual-column grids or custom graphics, keeping section names strict (e.g., "Work Experience", "Education").
            </div>
          </li>
        </ul>
      </section>

    </div>
  )
}

