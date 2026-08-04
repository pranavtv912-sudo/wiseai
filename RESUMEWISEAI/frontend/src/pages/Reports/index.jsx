import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listReports, deleteReport, getResume, downloadReportPdf } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Reports() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])

  const loadReports = async () => {
    try {
      const res = await listReports()
      if (res.success && res.data?.reports) {
        const reportsList = res.data.reports
        const fullReports = await Promise.all(
          reportsList.map(async (r) => {
            let resumeDetails = null
            let atsScore = 78
            let targetRole = 'Software Developer'
            let fileName = r.report_title
            
            try {
              if (r.resume_id) {
                const resumeRes = await getResume(r.resume_id)
                if (resumeRes.success && resumeRes.data?.resume) {
                  resumeDetails = resumeRes.data.resume
                  fileName = resumeDetails.file_name || resumeDetails.original_name || fileName
                  targetRole = resumeDetails.target_role || targetRole
                  atsScore = resumeDetails.ats_score || atsScore
                }
              }
            } catch (err) {
              console.warn(`Failed to fetch resume details for report ${r.id}:`, err)
            }
            
            return {
              ...r,
              file_name: fileName,
              target_role: targetRole,
              atsScore: atsScore,
              file_size: r.file_size || (resumeDetails ? resumeDetails.file_size : 0)
            }
          })
        )
        setReports(fullReports)
      }
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadReports()
    }
  }, [authenticated])

  const handleDelete = async (e, reportId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this analytical report?')) return
    try {
      await deleteReport(reportId)
      loadReports()
    } catch (err) {
      console.error('Failed to delete report:', err)
    }
  }

  const handleSelectReport = (report) => {
    if (report.resume_id) {
      localStorage.setItem('rw_last_analyzed_id', report.resume_id)
      localStorage.setItem('rw_last_score', report.atsScore)
      localStorage.setItem('rw_detected_track', report.target_role)
      navigate('/analysis')
    }
  }

  const handleDownload = async (e, reportId, reportTitle) => {
    e.stopPropagation()
    try {
      const response = await downloadReportPdf(reportId)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_Report.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download PDF report:', err)
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
    <div className="flex-1 max-w-6xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366F1] block mb-2">
            Archived Intelligence
          </span>
          <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
            Tactical <span className="text-gray-500 italic">Reports</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Access and manage generated analytical dossiers.
          </p>
        </div>
        <div>
          <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
            <span className="material-symbols-outlined text-[15px]">upload_file</span> Ingest New
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
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          Ingest History
        </Link>
        <Link 
          to="/reports"
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6366F1]/12 border border-[#6366F1]/35 text-[#6366F1] transition-all"
        >
          Reports Manager
        </Link>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <section className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-[2.2rem] p-10 max-w-lg mx-auto shadow-xl">
          <span className="material-symbols-outlined text-[#6366F1] text-5xl mb-4 block">description</span>
          <h3 className="vanguard-heading text-xl font-bold text-white mb-2">No Reports Available</h3>
          <p className="text-gray-400 text-xs mb-6">Ingest a resume file to generate your first technical gap report.</p>
          <Link to="/upload" className="island-button bg-[#6366F1] text-[#00173b] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Ingest Now
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id}
              onClick={() => handleSelectReport(report)}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/30 hover:shadow-[0_0_20px_rgba(99, 102, 241,0.1)] transition-all cursor-pointer relative group flex flex-col justify-between min-h-[220px]"
            >
              <div>
                {/* Top header row */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, report.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors z-10"
                    title="Delete Report"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Filename & Track */}
                <h4 className="text-base font-bold text-white truncate max-w-[90%] mb-1">{report.file_name}</h4>
                <p className="text-xs text-gray-400 font-mono mb-6">{report.target_role}</p>
              </div>

              {/* Lower Section: Score & Actions */}
              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-[#6366F1]/30 flex items-center justify-center font-mono text-xs text-[#6366F1] font-bold">
                    {report.atsScore}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ATS Score</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] text-gray-600 font-mono self-center">
                    {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '0 KB'}
                  </span>
                  <button 
                    onClick={(e) => handleDownload(e, report.id, report.file_name)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#6366F1]/10 border border-white/10 hover:border-[#6366F1]/30 flex items-center justify-center transition-all z-10 text-white hover:text-[#6366F1]"
                    title="Download Report"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

    </div>
  )
}

