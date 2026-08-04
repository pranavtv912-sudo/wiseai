import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadResume, parseResume, analyzeResume } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function UploadResume() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const fileInputRef = useRef(null)
  
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [logs, setLogs] = useState([])

  const addLog = (message, isError = false) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      text: message,
      isError
    }])
  }

  const handleCardMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    card.style.transform = `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.2)`
  }

  const handleCardMouseLeave = (card) => {
    card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg) translateZ(0px)`
    card.style.boxShadow = `none`
  }

  const handleUpload = async (file) => {
    setLogs([])
    addLog(`Starting upload sequence for: ${file.name}`)
    
    const selectedRole = targetRole || 'Software Engineer'
    addLog(`Target role: "${selectedRole}"`)
    
    setUploading(true)
    setStatusText('UPLOADING ARCHIVE...')
    setProgress(20)

    try {
      addLog("Uploading file to /api/resume/upload...")
      const result = await uploadResume(file, selectedRole)
      addLog(`Upload response status: success=${result.success}`)
      setProgress(45)
      setStatusText('PARSING RESUME DATA...')

      const resumeId = result.data?.resume?.id || result.data?.resume_id
      if (resumeId) {
        addLog(`Successfully registered Resume ID: ${resumeId}`)
        localStorage.setItem('rw_last_analyzed_id', resumeId)
        
        addLog("Sending parse request to /api/resume/<id>/parse...")
        const parseResult = await parseResume(resumeId)
        addLog(`Parse complete: success=${parseResult.success}`)
        setProgress(70)
        setStatusText('RUNNING CAREER STRATEGY ANALYSIS...')

        addLog("Sending analysis request to /api/analyze/...")
        const analysisResult = await analyzeResume(resumeId, selectedRole, jobDescription)
        addLog(`Analysis complete: success=${analysisResult.success}`)
        
        if (analysisResult.success && analysisResult.data?.analysis) {
          const analysis = analysisResult.data.analysis
          const atsScore = analysis.atsScore || 0
          const detectedTrack = analysis.detected_track || analysis.goalRole || analysis.targetRole || selectedRole
          localStorage.setItem('rw_last_score', atsScore)
          localStorage.setItem('rw_detected_track', detectedTrack)
        }
        
        setProgress(100)
        setStatusText('ANALYSIS COMPLETE. REDIRECTING...')
        addLog("Redirecting to Detailed Report...")
        
        setTimeout(() => navigate('/analysis'), 1200)
      } else {
        throw new Error("No resume ID returned from server.")
      }
    } catch (err) {
      console.error('Upload flow error:', err)
      addLog(`Error: ${err.message || 'Workflow halted.'}`, true)
      setStatusText('ERROR: ' + (err.message || 'Analysis failed.'))
      setProgress(0)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center relative z-10 w-full pt-20 pb-32">
      <span className="font-label-sm text-[10px] tracking-[0.4em] text-[#6366F1] uppercase mb-4 block vanguard-heading">
        Ingest Station
      </span>
      <h1 className="vanguard-heading text-4xl md:text-5xl font-bold mb-4">Ingest Resume</h1>
      <p className="text-gray-400 mb-12 max-w-md text-sm">
        Drag and drop your updated professional dossier to generate a dynamic competency roadmap.
      </p>

      {/* Workspace Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-white/10 pb-6 w-full max-w-2xl justify-center">
        <Link 
          to="/dashboard"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          Overview
        </Link>
        <Link 
          to="/upload"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6366F1]/12 border border-[#6366F1]/35 text-[#6366F1] transition-all"
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

      {/* Double-Bezel Drop Zone */}
      <div className="relative z-10 w-full max-w-2xl">
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0])
          }}
          className={`w-full p-2 rounded-[2.5rem] bg-white/5 border transition-all duration-300 relative group vanguard-card ${
            isDragOver ? 'border-[#6366F1] shadow-[0_0_40px_rgba(99, 102, 241,0.2)]' : 'border-white/15 shadow-2xl'
          }`}
          onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
          onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1]/30 to-purple-500/30 rounded-[2.6rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="relative bg-[#0A0A0A] rounded-[2rem] p-10 md:p-14 border border-white/20 backdrop-blur-[100px] overflow-hidden">
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-5 border border-[#6366F1]/20 floating-3d">
                <span className="material-symbols-outlined text-[#6366F1] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  upload_file
                </span>
              </div>
              
              {/* Target Role Input */}
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target Role (e.g. Frontend Engineer)" 
                className="mb-4 w-full max-w-md px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-600 focus:border-[#6366F1]/50 focus:outline-none focus:ring-1 focus:ring-[#6366F1]/30 transition-all text-center text-sm"
              />
              
              {/* Job Description TextArea */}
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Target Job Description (Optional - Paste JD to analyze matching & missing skills)"
                rows={4}
                className="mb-5 w-full max-w-md px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:border-[#6366F1]/50 focus:outline-none focus:ring-1 focus:ring-[#6366F1]/30 transition-all text-left text-sm resize-none"
              />
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf,.docx,.doc" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUpload(e.target.files[0])
                }}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-[#6366F1] text-[#00173b] px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center group hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                SELECT RESUME
                <span className="ml-3 w-6 h-6 bg-[#003824]/10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </span>
              </button>

              {/* Upload Progress */}
              {uploading && (
                <div className="w-full max-w-sm mt-5">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366F1] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-[#6366F1] mt-2">{statusText}</p>
                </div>
              )}

              {/* Real-time Console Log */}
              {logs.length > 0 && (
                <div className="w-full max-w-sm mt-4 p-3 bg-black/50 border border-white/10 rounded-xl font-mono text-[9px] text-left text-gray-400 max-h-24 overflow-y-auto space-y-1">
                  {logs.map((log, idx) => (
                    <div key={idx} className={log.isError ? 'text-red-400 font-bold' : 'text-[#6366F1]'}>
                      [{log.time}] {log.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

