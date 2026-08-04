import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listResumes, deleteResume } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function History() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [historyList, setHistoryList] = useState([])
  const [activeId, setActiveId] = useState(localStorage.getItem('rw_last_analyzed_id'))

  const loadHistory = async () => {
    try {
      const res = await listResumes()
      if (res.success && res.data?.resumes) {
        const resumes = res.data.resumes.map(r => ({
          ...r,
          score: r.ats_score ? Math.round(r.ats_score) : 0,
          detectedTrack: r.target_role || 'Software Developer'
        }))
        setHistoryList(resumes)
      }
    } catch (err) {
      console.error('Failed to load ingestion history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadHistory()
    }
  }, [authenticated])

  const handleLoadItem = (item) => {
    localStorage.setItem('rw_last_analyzed_id', item.id)
    localStorage.setItem('rw_last_score', item.score)
    localStorage.setItem('rw_detected_track', item.detectedTrack)
    setActiveId(item.id)
    navigate('/dashboard')
  }

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this dossier from your ingest log?')) return
    try {
      await deleteResume(id)
      if (activeId === id) {
        localStorage.removeItem('rw_last_analyzed_id')
        localStorage.removeItem('rw_last_score')
        localStorage.removeItem('rw_detected_track')
        setActiveId(null)
      }
      loadHistory()
    } catch (err) {
      console.error('Failed to delete history item:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 max-w-4xl mx-auto text-center pt-24">
        <div className="skeleton w-full max-w-md h-96 rounded-[2rem]" />
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366F1] block mb-2">
            Temporal Ingest Log
          </span>
          <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
            Ingest <span className="text-gray-500 italic">History</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Swap or clear currently loaded dossier footprints.
          </p>
        </div>
        <div>
          <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
            <span className="material-symbols-outlined text-[15px]">add</span> Ingest New
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
          to="/history"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6366F1]/12 border border-[#6366F1]/35 text-[#6366F1] transition-all"
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

      {/* History Items list */}
      {historyList.length === 0 ? (
        <section className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-[2.2rem] p-10 max-w-lg mx-auto shadow-xl">
          <span className="material-symbols-outlined text-[#6366F1] text-5xl mb-4 block">history</span>
          <h3 className="vanguard-heading text-xl font-bold text-white mb-2">Ingestion Log Empty</h3>
          <p className="text-gray-400 text-xs mb-6">You have not uploaded any resume files yet.</p>
          <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Upload File
          </Link>
        </section>
      ) : (
        <section className="bg-[#0A0A0A] border border-white/10 rounded-[2.2rem] overflow-hidden shadow-2xl p-6 md:p-8">
          <div className="space-y-4">
            {historyList.map((item) => {
              const isActive = activeId === item.id

              return (
                <div 
                  key={item.id}
                  onClick={() => handleLoadItem(item)}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                    isActive 
                      ? 'bg-[#6366F1]/5 border-[#6366F1]/30 shadow-[0_0_15px_rgba(99, 102, 241,0.1)]' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h4 className="text-base font-bold text-white truncate max-w-[85%]">{item.file_name}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                          Active Ingest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>Role: <strong className="text-gray-300">{item.target_role}</strong></span>
                      <span>•</span>
                      <span>Date: <strong className="text-gray-300">{item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Size: <strong className="text-gray-300">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : '0 KB'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                        isActive ? 'border-[#6366F1] text-[#6366F1]' : 'border-white/20 text-white'
                      }`}>
                        {item.score}
                      </div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">ATS</span>
                    </div>

                    <button 
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5 z-10"
                      title="Delete History Ingest"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}

