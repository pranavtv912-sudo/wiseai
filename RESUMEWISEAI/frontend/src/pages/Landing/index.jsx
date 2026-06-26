import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { useAuth } from '../../context/AuthContext'
import { uploadResume, parseResume, analyzeResume } from '../../services/api'

export default function Landing() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  
  const heroContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [targetRole, setTargetRole] = useState('')
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

  // Three.js Particle Matrix
  useEffect(() => {
    const container = heroContainerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 500
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const particlesCount = 1500
    const positions = new Float32Array(particlesCount * 3)
    const velocities = new Float32Array(particlesCount * 3)
    
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities[i * 3] = (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.035,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    
    const points = new THREE.Points(geometry, material)
    scene.add(points)
    camera.position.z = 5

    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5
      mouseY = (e.clientY / window.innerHeight) - 0.5
    }
    window.addEventListener('mousemove', onMouseMove)

    let rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const positionsAttr = geometry.attributes.position.array
      for (let i = 0; i < particlesCount; i++) {
        positionsAttr[i * 3] += velocities[i * 3]
        positionsAttr[i * 3 + 1] += velocities[i * 3 + 1]
        positionsAttr[i * 3 + 2] += velocities[i * 3 + 2]
        
        if (Math.abs(positionsAttr[i * 3]) > 5) velocities[i * 3] *= -1
        if (Math.abs(positionsAttr[i * 3 + 1]) > 5) velocities[i * 3 + 1] *= -1
        if (Math.abs(positionsAttr[i * 3 + 2]) > 5) velocities[i * 3 + 2] *= -1
      }
      geometry.attributes.position.needsUpdate = true
      points.rotation.y += 0.0008 + (mouseX * 0.005)
      points.rotation.x += 0.0008 + (mouseY * 0.005)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
    }
  }, [])

  // Magnetic 3D cards hover handler
  const handleCardMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    card.style.transform = `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 50px rgba(0,0,0,0.5), 0 0 30px rgba(78, 222, 163, 0.2)`
  }

  const handleCardMouseLeave = (card) => {
    card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg) translateZ(0px)`
    card.style.boxShadow = `none`
  }

  const handleUpload = async (file) => {
    setLogs([])
    addLog(`Starting upload sequence for: ${file.name}`)
    
    if (!authenticated) {
      addLog("Error: User is not authenticated. Redirecting to login...", true)
      setTimeout(() => navigate('/signin'), 1500)
      return
    }

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
        
        // Parse the resume
        addLog("Sending parse request to /api/resume/<id>/parse...")
        const parseResult = await parseResume(resumeId)
        addLog(`Parse complete: success=${parseResult.success}`)
        setProgress(70)
        setStatusText('RUNNING CAREER STRATEGY ANALYSIS...')

        // Run analysis
        addLog("Sending analysis request to /api/analyze/...")
        const analysisResult = await analyzeResume(resumeId, selectedRole)
        addLog(`Analysis complete: success=${analysisResult.success}`)
        
        if (analysisResult.success && analysisResult.data?.analysis) {
          const analysis = analysisResult.data.analysis
          const atsScore = analysis.atsScore || 0
          const detectedTrack = analysis.detected_track || analysis.goalRole || analysis.targetRole || selectedRole
          localStorage.setItem('rw_last_score', atsScore)
          localStorage.setItem('rw_detected_track', detectedTrack)
        } else {
          localStorage.setItem('rw_last_score', 0)
          localStorage.setItem('rw_detected_track', selectedRole)
        }
        
        setProgress(100)
        setStatusText('ANALYSIS COMPLETE. REDIRECTING...')
        addLog("Redirecting to Strategist Command...")
        
        setTimeout(() => navigate('/dashboard'), 1200)
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
    <div className="flex-1 flex flex-col relative">
      {/* Hero Section */}
      <section className="py-40 px-8 max-w-7xl mx-auto text-center relative overflow-visible w-full">
        {/* ThreeJS container */}
        <div ref={heroContainerRef} className="absolute inset-0 w-full h-full z-0 opacity-60 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="font-label-sm text-[10px] tracking-[0.4em] text-[#4edea3] uppercase mb-6 block vanguard-heading">
            The Silent Strategist
          </span>
          <h1 className="text-6xl md:text-[72px] font-bold leading-none max-w-4xl mx-auto mb-8 vanguard-heading tracking-tight">
            Precision Career Engineering
          </h1>
          <p className="font-body-lg text-lg text-gray-400 max-w-2xl mx-auto mb-16 tracking-widest uppercase opacity-70">
            AI-Driven Architectural Analysis for the Next-Gen Workforce
          </p>
        </div>

        {/* Double-Bezel Drop Zone */}
        <div className="relative z-10">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0])
            }}
            className={`max-w-3xl mx-auto p-2 rounded-[2.5rem] bg-white/5 border transition-all duration-300 relative group vanguard-card ${
              isDragOver ? 'border-[#4edea3] shadow-[0_0_40px_rgba(78,222,163,0.2)]' : 'border-white/15 shadow-2xl'
            }`}
            onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4edea3]/30 to-purple-500/30 rounded-[2.6rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative bg-[#0A0A0A] rounded-[2rem] p-12 md:p-20 border border-white/20 backdrop-blur-[100px] overflow-hidden">
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#4edea3]/10 flex items-center justify-center mb-6 border border-[#4edea3]/20 floating-3d">
                  <span className="material-symbols-outlined text-[#4edea3] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    upload_file
                  </span>
                </div>
                <h3 className="vanguard-heading text-2xl font-bold mb-2">Ingest Resume Data</h3>
                <p className="font-body-md text-gray-400 mb-4">Drop your PDF or DOCX to begin deep structural analysis.</p>
                
                {/* Target Role Input */}
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target Role (e.g. Software Engineer)" 
                  className="mb-6 w-full max-w-sm px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-600 focus:border-[#4edea3]/50 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/30 transition-all text-center"
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
                  className="bg-[#4edea3] text-[#003824] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center group hover:scale-[1.02] active:scale-95 transition-all"
                >
                  SELECT ARCHIVE
                  <span className="ml-3 w-8 h-8 bg-[#003824]/10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </span>
                </button>

                {/* Upload Progress */}
                {uploading && (
                  <div className="w-full max-w-sm mt-6">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4edea3] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#4edea3] mt-2">{statusText}</p>
                  </div>
                )}

                {/* Real-time Console Log */}
                {logs.length > 0 && (
                  <div className="w-full max-w-sm mt-4 p-3 bg-black/50 border border-white/10 rounded-xl font-mono text-[10px] text-left text-gray-400 max-h-28 overflow-y-auto space-y-1">
                    {logs.map((log, idx) => (
                      <div key={idx} className={log.isError ? 'text-red-400 font-bold' : 'text-[#4edea3]'}>
                        [{log.time}] {log.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-40 px-8 max-w-7xl mx-auto w-full">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-semibold mb-4 vanguard-heading">Tactical Intelligence</h2>
          <div className="h-1 w-20 bg-[#4edea3] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* ATS Shadow Simulator */}
          <div className="md:col-span-8 group">
            <div 
              className="p-2 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/15 flex flex-col backdrop-blur-3xl">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h4 className="vanguard-heading text-2xl font-bold mb-2">ATS Shadow Simulator</h4>
                    <p className="text-gray-400 text-sm max-w-md">Reverse-engineer the invisible algorithms determining your candidacy.</p>
                  </div>
                  <span className="material-symbols-outlined text-[#4edea3] text-4xl">visibility</span>
                </div>
                <div className="mt-auto rounded-xl overflow-hidden border border-white/10 aspect-[16/7] relative bg-gradient-to-br from-[#4edea3]/5 to-purple-500/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[#4edea3] text-6xl mb-4 block opacity-30">insights</span>
                      <p className="text-gray-500 text-sm">Upload a resume to see ATS analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skill Gap Intelligence */}
          <div className="md:col-span-4 group">
            <div 
              className="p-2 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/15 backdrop-blur-3xl">
                <span className="material-symbols-outlined text-[#4edea3] text-4xl mb-6">psychology</span>
                <h4 className="vanguard-heading text-2xl font-bold mb-2">Skill Gap Intelligence</h4>
                <p className="text-gray-400 text-sm mb-12">Identify precise missing nodes in your professional trajectory.</p>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#4edea3] w-3/4 rounded-full"></div></div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-1/2 rounded-full"></div></div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#4edea3]/50 w-5/6 rounded-full"></div></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Career Path */}
          <div className="md:col-span-4 group">
            <div 
              className="p-2 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/15 backdrop-blur-3xl">
                <span className="material-symbols-outlined text-[#4edea3] text-4xl mb-6">alt_route</span>
                <h4 className="vanguard-heading text-2xl font-bold mb-2">Trajectory Mapper</h4>
                <p className="text-gray-400 text-sm">Visualizing 10,000+ career evolution paths for your specific profile.</p>
              </div>
            </div>
          </div>
          
          {/* Real-time Roadmap */}
          <div className="md:col-span-8 group">
            <div 
              className="p-2 rounded-[2rem] bg-white/5 h-full vanguard-card border border-white/5"
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            >
              <div className="bg-[#0A0A0A] rounded-[1.75rem] p-8 h-full border border-white/15 flex flex-col md:flex-row gap-8 backdrop-blur-3xl">
                <div className="flex-1">
                  <h4 className="vanguard-heading text-2xl font-bold mb-2">Precision Roadmap</h4>
                  <p className="text-gray-400 text-sm">A step-by-step tactical execution plan generated in milliseconds.</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-3 text-sm text-[#4edea3]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Keyword Optimization
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">pending</span>
                      Certification Acquisition
                    </li>
                  </ul>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-mono">
                    [ROADMAP CANVAS MINIMIZED]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-[#4edea3]/10 blur-[120px] rounded-full scale-150 translate-y-1/2"></div>
        <div className="px-8 max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 vanguard-heading">Architect Your Future.</h2>
          <p className="font-body-lg text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Join the top 1% of candidates who leverage precision engineering to bypass the noise and land elite opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => {
                if (authenticated) {
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                } else {
                  navigate('/signup')
                }
              }}
              className="island-button bg-[#4edea3] text-[#003824] px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center group transition-all"
            >
              COMMENCE ANALYSIS
              <span className="ml-4 w-10 h-10 bg-[#003824]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">rocket_launch</span>
              </span>
            </button>
            <Link to="/roadmap" className="island-button bg-white/5 border border-white/15 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center group transition-all hover:bg-white/10">
              VIEW METHODOLOGY
              <span className="ml-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <span className="material-symbols-outlined">auto_graph</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-24 border-t border-white/10 relative z-10 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="vanguard-heading text-2xl font-bold text-white mb-2">ResumeWise AI</div>
            <p className="text-gray-400 text-xs text-center md:text-left">© 2024 ResumeWise AI. Precision Career Engineering.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all" href="#">Privacy Policy</a>
            <a className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all" href="#">Terms of Service</a>
            <Link className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all" to="/resources">Resources</Link>
            <a className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
