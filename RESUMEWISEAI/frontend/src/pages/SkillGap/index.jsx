import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSkillGap, analyzeResume, getRoles } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function SkillGap() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [gaps, setGaps] = useState([])
  const [matchingSkills, setMatchingSkills] = useState([])
  const [coverage, setCoverage] = useState(0)
  const [track, setTrack] = useState('')
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('')

  useEffect(() => {
    if (!authenticated) {
      navigate('/signin')
    }
  }, [authenticated, navigate])

  async function loadData() {
    const resumeId = localStorage.getItem('rw_last_analyzed_id')
    if (!resumeId) {
      setLoading(false)
      return
    }
    try {
      // Fetch available roles
      const rolesRes = await getRoles()
      if (rolesRes.success && rolesRes.data?.roles) {
        setRoles(rolesRes.data.roles)
      }

      // Fetch active skill gap details
      const res = await getSkillGap(resumeId)
      if (res.success && res.data?.skillGap) {
        const sg = res.data.skillGap
        setTrack(sg.target_role || 'Developer')
        setSelectedRole(sg.target_role || '')
        
        const missing = [
          ...(sg.missing_required_skills || []).map(s => typeof s === 'string' ? { name: s, status: 'Critical Gap', level: 30 } : s),
          ...(sg.missing_preferred_skills || []).map(s => typeof s === 'string' ? { name: s, status: 'Partial Match', level: 60 } : s)
        ]
        setGaps(missing)
        setMatchingSkills(sg.matching_skills || [])
        setCoverage(sg.coverage_percentage || 0)
      }
    } catch (err) {
      console.error('Failed to load skill gaps:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  const handleRoleChange = async (newRole) => {
    const resumeId = localStorage.getItem('rw_last_analyzed_id')
    if (!resumeId || !newRole) return
    
    setUpdating(true)
    try {
      const res = await analyzeResume(resumeId, newRole)
      if (res.success && res.data?.analysis) {
        const analysis = res.data.analysis
        localStorage.setItem('rw_last_score', analysis.atsScore || analysis.total_ats_score || 0)
        localStorage.setItem('rw_detected_track', newRole)
        
        // Reload new skill gaps
        const gapRes = await getSkillGap(resumeId)
        if (gapRes.success && gapRes.data?.skillGap) {
          const sg = gapRes.data.skillGap
          setTrack(sg.target_role || newRole)
          setSelectedRole(sg.target_role || newRole)
          
          const missing = [
            ...(sg.missing_required_skills || []).map(s => typeof s === 'string' ? { name: s, status: 'Critical Gap', level: 30 } : s),
            ...(sg.missing_preferred_skills || []).map(s => typeof s === 'string' ? { name: s, status: 'Partial Match', level: 60 } : s)
          ]
          setGaps(missing)
          setMatchingSkills(sg.matching_skills || [])
          setCoverage(sg.coverage_percentage || 0)
        }
      }
    } catch (err) {
      console.error('Error updating target role:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 max-w-4xl mx-auto text-center pt-24">
        <div className="skeleton w-full max-w-md h-96 rounded-[2rem]" />
      </div>
    )
  }

  if (!localStorage.getItem('rw_last_analyzed_id')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center pt-24 pb-32 relative z-10">
        <span className="material-symbols-outlined text-[#6366F1] text-6xl mb-6">insights</span>
        <h1 className="vanguard-heading text-4xl font-bold mb-4">No Active Resume</h1>
        <p className="text-gray-400 mb-8 max-w-md">Please upload a resume dossier to analyze skill gaps.</p>
        <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest">
          Ingest Resume Now
        </Link>
      </div>
    )
  }

  const priorityColors = {
    'Critical Gap': 'text-red-400 border-red-500/25 bg-red-950/20',
    'Node Missing': 'text-amber-400 border-amber-500/25 bg-amber-950/20',
    'Partial Match': 'text-purple-400 border-purple-500/25 bg-purple-950/20',
    'Emerging': 'text-[#6366F1] border-[#6366F1]/25 bg-[#6366F1]/5'
  }

  const progressColors = {
    'Critical Gap': 'bg-red-500',
    'Node Missing': 'bg-amber-400',
    'Partial Match': 'bg-purple-500',
    'Emerging': 'bg-[#6366F1]'
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366F1] block mb-2">
            Competency Gap Audit
          </span>
          <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
            Gap <span className="text-gray-500 italic">Intelligence</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Target Track: <span className="text-white font-semibold font-mono">{track}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/roadmap" className="island-button bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Open Roadmap
          </Link>
          <Link to="/resources" className="island-button bg-[#6366F1] text-[#00173b] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
            <span className="material-symbols-outlined text-[14px]">play_circle</span> Learning Resources
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
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          Detailed Report
        </Link>
        <Link 
          to="/skill-gap"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6366F1]/12 border border-[#6366F1]/35 text-[#6366F1] transition-all"
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

      {/* Target Role Selector Panel */}
      <section className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Target Profile Role</h4>
          <p className="text-xs text-gray-500">Analyze competency alignment against specific job profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          {updating && <span className="text-[10px] text-[#6366F1] font-mono animate-pulse uppercase">Syncing Role...</span>}
          <select 
            disabled={updating}
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#6366F1]/50 focus:outline-none transition-all cursor-pointer font-sans min-w-[200px]"
          >
            <option value="" disabled className="bg-[#0A0A0A]">Select Role Profile</option>
            {roles.map((r, i) => (
              <option key={i} value={r.title} className="bg-[#0A0A0A]">{r.title}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Intro Stats Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gaps Audited</div>
          <div className="text-3xl font-bold text-white font-mono">{gaps.length}</div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Matching Competencies</div>
          <div className="text-3xl font-bold text-purple-400 font-mono">
            {matchingSkills.length}
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Coverage Index</div>
          <div className="text-3xl font-bold text-[#6366F1] font-mono">{coverage}%</div>
        </div>
      </section>

      {/* Gap Lists Table */}
      <section className="bg-[#0A0A0A] border border-white/10 rounded-[2.2rem] overflow-hidden shadow-2xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Priority Skill Deficits</h3>
        
        {gaps.length === 0 ? (
          <p className="text-gray-500 text-xs font-mono text-center py-6">Your credentials match all required criteria perfectly.</p>
        ) : (
          <div className="space-y-6">
            {gaps.map((gap, i) => {
              const name = typeof gap === 'string' ? gap : gap.name
              const status = typeof gap === 'string' ? 'Critical Gap' : gap.status
              const level = typeof gap === 'string' ? 50 : gap.level
              const col = priorityColors[status] || 'text-white border-white/10 bg-white/5'
              const pcol = progressColors[status] || 'bg-[#6366F1]'

              return (
                <div 
                  key={i} 
                  className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:bg-white/[0.04] hover:border-white/10"
                >
                  {/* Left Area: Name & Priority Badge */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h4 className="text-lg font-bold text-white tracking-tight">{name}</h4>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${col}`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 max-w-sm">
                      <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${pcol} rounded-full`} style={{ width: `${level}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{level}% Gap</span>
                    </div>
                  </div>

                  {/* Right Area: Action Triggers */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/resources?q=${encodeURIComponent(name)}`)}
                      className="island-button bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 hover:bg-[#6366F1]/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">search</span>
                      Find Courses
                    </button>
                    <button 
                      onClick={() => navigate(`/interview?topic=${encodeURIComponent(name)}`)}
                      className="island-button bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">forum</span>
                      Practice Interview
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}

