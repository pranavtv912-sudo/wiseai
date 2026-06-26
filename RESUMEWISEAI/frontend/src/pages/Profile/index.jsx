import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listResumes, getProfile, updateProfile } from '../../services/api'

export default function Profile() {
  const { user, loginUser } = useAuth()
  
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [targetTrack, setTargetTrack] = useState(localStorage.getItem('rw_detected_track') || 'Full Stack')
  const [isEditing, setIsEditing] = useState(false)
  const [resumeCount, setResumeCount] = useState(0)
  const [activeScore, setActiveScore] = useState(localStorage.getItem('rw_last_score') || 0)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await listResumes()
        if (res.success && res.data?.resumes) {
          setResumeCount(res.data.resumes.length)
        }
      } catch (err) {
        console.error(err)
      }

      try {
        const profileRes = await getProfile()
        if (profileRes.success && profileRes.data?.user) {
          const u = profileRes.data.user
          setName(u.name || '')
          setTargetTrack(u.target_role || localStorage.getItem('rw_detected_track') || 'Full Stack')
          loginUser(u)
        }
      } catch (err) {
        console.error('Failed to load profile from backend:', err)
      }
    }
    loadStats()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await updateProfile({ name, target_role: targetTrack })
      if (res.success && res.data?.user) {
        const updatedUser = res.data.user
        loginUser(updatedUser)
        localStorage.setItem('rw_detected_track', targetTrack)
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Failed to save profile changes:', err)
    }
  }

  // Count roadmap nodes completed from localStorage
  let completedNodes = 0
  const roadmapStatus = localStorage.getItem('rw_roadmap_status')
  if (roadmapStatus) {
    try {
      const parsed = JSON.parse(roadmapStatus)
      completedNodes = Object.values(parsed).filter(status => status === 'done').length
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4edea3] block mb-2">
          Operative Dossier Credentials
        </span>
        <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
          Operative <span className="text-gray-500 italic">Profile</span>
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Stats Dossier */}
        <div className="md:col-span-1 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#4edea3] text-3xl">person</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{user?.name || 'Operative'}</h3>
            <p className="text-xs text-gray-500 truncate mb-6">{user?.email}</p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4 text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Ingested Files</span>
              <span className="text-white font-mono font-bold">{resumeCount}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Current ATS score</span>
              <span className="text-[#4edea3] font-mono font-bold">{activeScore}%</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Roadmap Nodes Finished</span>
              <span className="text-purple-400 font-mono font-bold">{completedNodes}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details Forms */}
        <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Profile Details</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#4edea3] font-bold hover:underline uppercase tracking-wider"
              >
                Edit Dossier
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="relative group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mt-1.5 focus:outline-none focus:border-[#4edea3]/40"
                  required
                />
              </div>

              {/* Email (Readonly) */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address (Locked)</label>
                <input 
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 mt-1.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Target Track */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Career Track</label>
                <select 
                  value={targetTrack}
                  onChange={(e) => setTargetTrack(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mt-1.5 focus:outline-none focus:border-[#4edea3]/40 cursor-pointer"
                >
                  <option value="Full Stack" className="bg-[#0A0A0A]">Full Stack</option>
                  <option value="Frontend" className="bg-[#0A0A0A]">Frontend</option>
                  <option value="Backend" className="bg-[#0A0A0A]">Backend</option>
                  <option value="DevOps" className="bg-[#0A0A0A]">DevOps</option>
                  <option value="AI / ML" className="bg-[#0A0A0A]">AI / ML</option>
                </select>
              </div>

              {/* Save/Cancel buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="bg-[#4edea3] text-[#003824] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Save Ingest
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setName(user?.name || '')
                    setTargetTrack(user?.target_role || localStorage.getItem('rw_detected_track') || 'Full Stack')
                    setIsEditing(false)
                  }}
                  className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <div className="text-[10px] font-bold uppercase text-gray-500">Full Name</div>
                <div className="text-base text-white font-medium mt-1">{user?.name || 'Operative'}</div>
              </div>
              <div className="border-b border-white/5 pb-4">
                <div className="text-[10px] font-bold uppercase text-gray-500">Email Address</div>
                <div className="text-base text-white font-medium mt-1">{user?.email}</div>
              </div>
              <div className="pb-4">
                <div className="text-[10px] font-bold uppercase text-gray-500">Target Track Focus</div>
                <div className="text-base text-[#4edea3] font-medium font-mono mt-1">{targetTrack}</div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
