import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { youtubeSearch, getAnalysis, generateLearningPlan, getProgress, updateProgress, addHistory } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PremiumVideoModal from '../../components/PremiumVideoModal'

const FALLBACKS = {
  default: [
    { video_id: 'rfscVS0vtik', title: 'Python for Beginners – Full Course', channel: 'freeCodeCamp', description: 'Learn Python from scratch.', url: 'https://www.youtube.com/watch?v=rfscVS0vtik', thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtik/mqdefault.jpg' },
    { video_id: 'PkZNo7MFNFg', title: 'JavaScript Tutorial for Beginners', channel: 'Programming with Mosh', description: 'Complete JS course.', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg' },
    { video_id: 'SqcY0GlETPk', title: 'React JS – Full Course for Beginners', channel: 'freeCodeCamp', description: 'Learn React.js.', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/mqdefault.jpg' },
    { video_id: 'fqMOX6JJhGo', title: 'Docker Tutorial for Beginners', channel: 'freeCodeCamp', description: 'Docker full guide.', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', thumbnail: 'https://i.ytimg.com/vi/fqMOX6JJhGo/mqdefault.jpg' },
    { video_id: 'nu_pCVPKzTk', title: 'Git and GitHub for Beginners', channel: 'freeCodeCamp', description: 'Learn Git & GitHub.', url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk', thumbnail: 'https://i.ytimg.com/vi/nu_pCVPKzTk/mqdefault.jpg' },
    { video_id: 'i_LwzRVP7bg', title: 'Kubernetes Tutorial for Beginners', channel: 'TechWorld with Nana', description: 'Full Kubernetes course.', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', thumbnail: 'https://i.ytimg.com/vi/i_LwzRVP7bg/mqdefault.jpg' },
    { video_id: 'k1RI5locZE4', title: 'AWS Cloud Practitioner Full Course', channel: 'freeCodeCamp', description: 'AWS certified training.', url: 'https://www.youtube.com/watch?v=k1RI5locZE4', thumbnail: 'https://i.ytimg.com/vi/k1RI5locZE4/mqdefault.jpg' },
    { video_id: 'HXV3zeQKqGY', title: 'SQL Full Course', channel: 'freeCodeCamp', description: 'Master SQL.', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', thumbnail: 'https://i.ytimg.com/vi/HXV3zeQKqGY/mqdefault.jpg' },
    { video_id: '2V1UUhBJ62Y', title: 'System Design for Beginners', channel: 'Exponent', description: 'System design fundamentals.', url: 'https://www.youtube.com/watch?v=2V1UUhBJ62Y', thumbnail: 'https://i.ytimg.com/vi/2V1UUhBJ62Y/mqdefault.jpg' },
  ],
  Python: [
    { video_id: 'rfscVS0vtik', title: 'Learn Python – Full Course for Beginners', channel: 'freeCodeCamp', description: '4-hour Python crash course.', url: 'https://www.youtube.com/watch?v=rfscVS0vtik', thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtik/mqdefault.jpg' },
    { video_id: '_uQrJ0TkZlc', title: 'Python Tutorial for Beginners', channel: 'Programming with Mosh', description: '6-hour Python tutorial.', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/mqdefault.jpg' },
    { video_id: 'kqtD5dpn9C8', title: 'Python for Beginners – Learn Fast', channel: 'Programming with Mosh', description: 'Quick Python intro.', url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', thumbnail: 'https://i.ytimg.com/vi/kqtD5dpn9C8/mqdefault.jpg' },
    { video_id: 'YYXdXT2l-Gg', title: 'Python Tutorials for Absolute Beginners', channel: 'CS Dojo', description: 'Beginner-friendly Python.', url: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', thumbnail: 'https://i.ytimg.com/vi/YYXdXT2l-Gg/mqdefault.jpg' },
    { video_id: '8DvywoWv6fI', title: 'Python for Everybody – Full University Course', channel: 'freeCodeCamp', description: 'University-level Python.', url: 'https://www.youtube.com/watch?v=8DvywoWv6fI', thumbnail: 'https://i.ytimg.com/vi/8DvywoWv6fI/mqdefault.jpg' },
  ],
  JavaScript: [
    { video_id: 'PkZNo7MFNFg', title: 'JavaScript Tutorial – Beginners to Advanced', channel: 'Programming with Mosh', description: 'Complete JS fundamentals.', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg' },
    { video_id: 'hdI2bqOjy3c', title: 'JavaScript Crash Course', channel: 'Traversy Media', description: 'JS crash course.', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', thumbnail: 'https://i.ytimg.com/vi/hdI2bqOjy3c/mqdefault.jpg' },
    { video_id: 'W6NZfCO5SIk', title: 'JavaScript Tutorial for Beginners', channel: 'Traversy Media', description: 'Beginners JS guide.', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/mqdefault.jpg' },
    { video_id: 'jS4aFq5-91M', title: 'JavaScript Full Course', channel: 'Bro Code', description: 'Full JS course.', url: 'https://www.youtube.com/watch?v=jS4aFq5-91M', thumbnail: 'https://i.ytimg.com/vi/jS4aFq5-91M/mqdefault.jpg' },
  ],
  'System Design': [
    { video_id: 'i7twT3x5yv8', title: 'System Design Interview – Step By Step', channel: 'Exponent', description: 'System design interview prep.', url: 'https://www.youtube.com/watch?v=i7twT3x5yv8', thumbnail: 'https://i.ytimg.com/vi/i7twT3x5yv8/mqdefault.jpg' },
    { video_id: 'MbjObHmDbZo', title: '10 System Design Concepts You Must Know', channel: 'Fireship', description: 'Key system design ideas.', url: 'https://www.youtube.com/watch?v=MbjObHmDbZo', thumbnail: 'https://i.ytimg.com/vi/MbjObHmDbZo/mqdefault.jpg' },
    { video_id: '2V1UUhBJ62Y', title: 'Crack the System Design Interview', channel: 'Exponent', description: 'System design prep guide.', url: 'https://www.youtube.com/watch?v=2V1UUhBJ62Y', thumbnail: 'https://i.ytimg.com/vi/2V1UUhBJ62Y/mqdefault.jpg' },
  ]
}

const TOPICS = ['All', 'Python', 'JavaScript', 'System Design']

export default function LearningPlan() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState('All')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)
  
  const [tab, setTab] = useState('plan')
  const [planData, setPlanData] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [progressMap, setProgressMap] = useState({})

  // Sync initial query parameter
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
      performSearch(q)
      setTab('search')
    } else {
      loadTopicVideos('All')
    }
  }, [searchParams])

  useEffect(() => {
    async function loadLearningPlan() {
      const resumeId = localStorage.getItem('rw_last_analyzed_id')
      if (!resumeId) {
        setTab('search')
        return
      }
      setLoadingPlan(true)
      try {
        const analysisRes = await getAnalysis(resumeId)
        if (analysisRes.success && analysisRes.data) {
          const analysis = analysisRes.data.analysis || analysisRes.data
          const missing = (analysis.skills?.missing_required || analysis.missingRequiredSkills || []).map(s => typeof s === 'string' ? s : s.name);
          
          if (missing.length > 0) {
            const planRes = await generateLearningPlan(missing, 3)
            if (planRes.success && planRes.data?.learningPlan) {
              setPlanData(planRes.data.learningPlan)
            }
          }
        }
        
        const progRes = await getProgress()
        if (progRes.success && progRes.data?.progress) {
          const pMap = {}
          progRes.data.progress.forEach(p => {
            pMap[p.skill_name] = p.completed
          })
          setProgressMap(pMap)
        }
      } catch (err) {
        console.error('Failed to load learning plan:', err)
      } finally {
        setLoadingPlan(false)
      }
    }
    loadLearningPlan()
  }, [])

  const handleToggleComplete = async (skillName) => {
    const isCompleted = !progressMap[skillName]
    setProgressMap(prev => ({ ...prev, [skillName]: isCompleted }))
    try {
      await updateProgress(skillName, isCompleted ? 100 : 0, isCompleted)
    } catch (err) {
      console.error('Failed to update progress:', err)
      setProgressMap(prev => ({ ...prev, [skillName]: !isCompleted }))
    }
  }

  const handlePlayVideo = async (video, skillName = 'General') => {
    setActiveVideo(video)
    try {
      await addHistory(video.video_id, video.title, skillName)
    } catch (err) {
      console.error('Failed to add watch history:', err)
    }
  }

  const loadTopicVideos = async (topic) => {
    setLoading(true)
    setActiveTopic(topic)
    
    // Check if we can search the API
    if (topic !== 'All') {
      try {
        const res = await youtubeSearch(`${topic} tutorial`, 9)
        if (res.success && res.data?.videos?.length) {
          setVideos(res.data.videos)
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('API error, falling back to local files:', e)
      }
    }

    // Local Fallbacks
    const fallbackList = FALLBACKS[topic] || FALLBACKS.default
    setVideos(fallbackList)
    setLoading(false)
  }

  const performSearch = async (queryStr) => {
    const term = queryStr || searchQuery
    if (!term.trim()) return
    setLoading(true)
    setActiveTopic('')
    try {
      const res = await youtubeSearch(term, 9)
      if (res.success && res.data?.videos) {
        setVideos(res.data.videos)
      } else {
        setVideos([])
      }
    } catch (e) {
      console.error(e)
      setVideos(FALLBACKS.default)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
    performSearch()
  }

  return (
    <div className="flex-1 max-w-[1400px] mx-auto p-[32px] pb-40 w-full relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <section className="pt-24 pb-14 flex flex-col items-center text-center gap-6 w-full">
        <div>
          <h1 className="vanguard-heading text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white">
            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4edea3] to-[#d0bcff]">Hub</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real YouTube tutorials and structured plans curated for your skill gaps.
          </p>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex gap-2.5 p-1 bg-white/5 border border-white/10 rounded-full">
          <button
            onClick={() => setTab('plan')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'plan' ? 'bg-[#4edea3] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Learning Plan
          </button>
          <button
            onClick={() => setTab('search')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'search' ? 'bg-[#4edea3] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Search Library
          </button>
        </div>
      </section>

      {tab === 'plan' ? (
        <section className="space-y-8">
          {loadingPlan ? (
            <div className="space-y-6">
              {[1, 2, 3].map(n => <div key={n} className="skeleton h-44 rounded-[2rem]" />)}
            </div>
          ) : !planData || !planData.skills || planData.skills.length === 0 ? (
            <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-[2.2rem] p-10 max-w-lg mx-auto shadow-xl">
              <span className="material-symbols-outlined text-[#4edea3] text-5xl mb-4 block">school</span>
              <h3 className="vanguard-heading text-xl font-bold text-white mb-2">No active Learning Plan</h3>
              <p className="text-gray-400 text-xs mb-6">Upload a resume with identified competency gaps to initialize your learning roadmap.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {planData.skills.map((s, idx) => {
                const isDone = !!progressMap[s.skill]
                return (
                  <div key={idx} className="p-1.5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-[#4edea3]/10 transition-all">
                    <div className="bg-[#0A0A0A] rounded-[calc(2rem-0.375rem)] p-8 border border-white/10 flex flex-col md:flex-row gap-8 justify-between">
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-widest font-mono">
                            Week {s.startWeek} - {s.endWeek}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                            isDone ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {isDone ? 'Completed' : 'Active Gap'}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white tracking-tight">{s.skill}</h3>
                        
                        {/* Practice project suggestions */}
                        {s.projects?.length > 0 && (
                          <div className="text-xs text-gray-400">
                            <strong className="text-white block mb-1 uppercase tracking-wider text-[10px]">Practice Assignments:</strong>
                            <ul className="list-disc pl-4 space-y-1">
                              {s.projects.map((proj, i) => <li key={i}>{proj}</li>)}
                            </ul>
                          </div>
                        )}
                        
                        {/* Resource tutorials links */}
                        {s.resources?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <strong className="text-white block mb-2 uppercase tracking-wider text-[10px]">Curated Video Guides:</strong>
                            <div className="flex flex-wrap gap-2.5">
                              {s.resources.map((v, i) => (
                                <button
                                  key={i}
                                  onClick={() => handlePlayVideo(v, s.skill)}
                                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-[#4edea3]/10 hover:text-[#4edea3] border border-white/10 text-[10px] text-gray-300 font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[13px]">play_circle</span>
                                  {v.title.slice(0, 45)}...
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Checkbox tracker */}
                      <div className="flex items-center justify-center md:border-l border-white/10 md:pl-8">
                        <button
                          onClick={() => handleToggleComplete(s.skill)}
                          className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3] shadow-[0_0_20px_rgba(78,222,163,0.15)]' 
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl font-bold">
                            {isDone ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Search Input Bar */}
          <section className="mb-10 w-full flex justify-center">
            <form onSubmit={handleSearchSubmit} className="flex gap-3 w-full max-w-2xl">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                  search
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any skill — Python, Docker, System Design…"
                  className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-gray-600 transition-all focus:outline-none focus:border-[#4edea3]/40 focus:ring-1 focus:ring-[#4edea3]/20"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#4edea3] text-[#003824] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>Search
              </button>
            </form>
          </section>

          {/* Topic Tabs */}
          <section className="mb-10 w-full flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSearchParams({})
                    setSearchQuery('')
                    loadTopicVideos(topic)
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                    activeTopic === topic
                      ? 'bg-[#4edea3]/12 border-[#4edea3]/35 text-[#4edea3]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>

          {/* Video Cards Grid */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="vanguard-heading text-2xl font-bold text-white">
                {activeTopic ? `${activeTopic} Intelligence` : `Search results for: "${searchQuery}"`}
              </h3>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                {videos.length} tutorials found
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="skeleton h-60 rounded-[1.6rem]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {videos.map((v, i) => (
                  <div 
                    key={i}
                    onClick={() => handlePlayVideo(v)}
                    className="vid-card bg-[#0A0A0A] rounded-[1.6rem] border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-6px] hover:border-[#4edea3]/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(78,222,163,0.12)]"
                  >
                    <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center group">
                      <img 
                        src={v.thumbnail || `https://i.ytimg.com/vi/${v.video_id}/mqdefault.jpg`} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-bold uppercase tracking-widest text-[#4edea3] mb-2">
                        {v.channel || 'YouTube'}
                      </div>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#4edea3] transition-colors">
                        {v.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Premium Video Modal Player */}
      <PremiumVideoModal 
        activeVideo={activeVideo} 
        setActiveVideo={setActiveVideo} 
      />

    </div>
  )
}
