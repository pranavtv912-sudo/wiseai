import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listResumes, analyzeJDMatch } from '../../services/api'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export default function JobDescriptionAnalyzer() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const res = await listResumes()
      if (res.success && res.data) {
        setResumes(res.data)
        if (res.data.length > 0) {
          setSelectedResume(res.data[0].id)
        }
      }
    } catch (err) {
      console.error("Error fetching resumes:", err)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError("Please select a resume.")
      return
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      setError("Please enter a valid job description (at least 50 characters).")
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await analyzeJDMatch(selectedResume, jobDescription)
      if (res.success && res.data) {
        setResult(res.data)
      } else {
        setError(res.message || "Failed to analyze match.")
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during analysis.")
    } finally {
      setLoading(false)
    }
  }

  // Chart Data preparation
  const getDoughnutData = () => {
    if (!result) return null
    return {
      labels: ['Match Score', 'Remaining'],
      datasets: [
        {
          data: [result.matchScore, 100 - result.matchScore],
          backgroundColor: ['#6366F1', '#111'],
          borderWidth: 0,
          cutout: '80%'
        }
      ]
    }
  }

  const getBarData = () => {
    if (!result) return null
    return {
      labels: ['Keyword', 'Experience', 'Education'],
      datasets: [
        {
          label: 'Match (%)',
          data: [result.keywordCoverage, result.experienceMatch, result.educationMatch],
          backgroundColor: ['#a78bfa', '#60a5fa', '#fbbf24'],
          borderRadius: 8,
          barThickness: 30
        }
      ]
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    }
  }

  return (
    <div className="w-full px-6 lg:px-12 py-8 max-w-[1400px] mx-auto animate-fade-in pb-20">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl text-white font-bold tracking-tight mb-4 flex items-center gap-4 vanguard-heading">
          <span className="material-symbols-outlined text-[40px] text-[#6366F1]">radar</span>
          Job Match Analyzer
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
          Leverage AI to perfectly align your resume with any job description. Identify missing keywords, tailor your experience, and dramatically increase your ATS ranking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[20px] p-6 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
            
            <div className="mb-6">
              <label className="block text-white text-xs font-bold uppercase tracking-widest mb-3">
                1. Select Resume
              </label>
              {resumes.length > 0 ? (
                <div className="relative">
                  <select 
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] transition-colors"
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id} className="bg-[#111]">
                        {r.file_name} ({new Date(r.uploaded_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-3.5 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                  No resumes found. <Link to="/upload" className="font-bold underline">Upload one first.</Link>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-white text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                2. Paste Job Description
                <span className="text-gray-500 text-[10px] lowercase normal-case tracking-normal font-normal">{jobDescription.length} chars</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-4 h-64 focus:outline-none focus:border-[#6366F1] transition-colors resize-none custom-scrollbar"
              />
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span> {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedResume}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#3baf81] text-[#00173b] hover:shadow-[0_0_30px_rgba(99, 102, 241,0.3)] text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Analyzing Match...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">psychology</span> Analyze JD
                </>
              )}
            </button>
            
          </div>
        </div>

        {/* Right Column: Dashboard Results */}
        <div className="lg:col-span-8">
          
          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/10 rounded-[20px]">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-[#6366F1]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#6366F1] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#6366F1] text-3xl animate-pulse">radar</span>
                </div>
              </div>
              <h3 className="text-xl text-white font-bold tracking-widest uppercase mb-2">Analyzing JD</h3>
              <p className="text-gray-500 text-sm">Gemini is comparing your resume to the job description...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0A0A0A]/50 border border-white/5 rounded-[20px] border-dashed">
              <span className="material-symbols-outlined text-gray-700 text-6xl mb-4">document_scanner</span>
              <p className="text-gray-500 text-sm">Select a resume and paste a JD to see the match analysis.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
              
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Circular Match Score */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[20px] p-8 flex items-center justify-between shadow-xl">
                  <div>
                    <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Overall Match</h3>
                    <p className="text-gray-400 text-sm max-w-[200px]">Probability of passing ATS screening based on current alignment.</p>
                    
                    <div className="mt-6 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#6366F1]/10 text-[#6366F1] text-[10px] font-bold uppercase tracking-widest border border-[#6366F1]/20">
                        {result.matchScore >= 80 ? 'Excellent' : result.matchScore >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-32 h-32 relative flex-shrink-0">
                    <Doughnut data={getDoughnutData()} options={{ cutout: '80%', plugins: { tooltip: { enabled: false } } }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{result.matchScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Sub-scores Bar Chart */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[20px] p-6 shadow-xl flex flex-col">
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Alignment Breakdown</h3>
                  <div className="flex-1 min-h-[120px]">
                    <Bar data={getBarData()} options={barOptions} />
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Matching Skills */}
                <div className="bg-white/5 border border-white/10 rounded-[20px] p-6">
                  <h4 className="text-[#6366F1] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Matching Skills
                  </h4>
                  {result.matchingSkills && result.matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.matchingSkills.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#6366F1]/10 text-[#6366F1] text-[11px] font-semibold rounded-full border border-[#6366F1]/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">No matching skills found.</p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-[20px] p-6">
                  <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">warning</span> Missing Keywords
                  </h4>
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[11px] font-semibold rounded-full border border-red-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Excellent! No major skills missing.</p>
                  )}
                </div>
              </div>

              {/* Feedback and Suggestions */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-[20px] p-6 shadow-xl">
                <h4 className="text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span> AI Recommendations
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths & Weaknesses */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-white text-sm font-bold mb-3">Key Strengths</h5>
                      <ul className="space-y-2">
                        {result.strengths && result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-400 text-xs leading-relaxed">
                            <span className="text-[#6366F1] mt-0.5">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white text-sm font-bold mb-3">Weaknesses</h5>
                      <ul className="space-y-2">
                        {result.weaknesses && result.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-400 text-xs leading-relaxed">
                            <span className="text-red-400 mt-0.5">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actionable Suggestions */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                    <h5 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">lightbulb</span> Action Plan
                    </h5>
                    <ul className="space-y-3">
                      {result.suggestions && result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                            {i+1}
                          </span>
                          <span className="text-gray-300 text-xs leading-relaxed pt-0.5">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  )
}

