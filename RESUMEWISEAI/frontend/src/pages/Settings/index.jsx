import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession } from '../../services/api'

export default function Settings() {
  const navigate = useNavigate()
  
  const [particles, setParticles] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load initial settings
  useEffect(() => {
    const data = localStorage.getItem('rw_app_settings')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed.particles !== undefined) setParticles(parsed.particles)
        if (parsed.animationSpeed !== undefined) setAnimationSpeed(parsed.animationSpeed)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    const settings = { mockBackend: false, particles, animationSpeed }
    localStorage.setItem('rw_app_settings', JSON.stringify(settings))
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleClearCache = () => {
    if (!window.confirm('WARNING: This will clear your user session and logs. You will be logged out. Continue?')) return
    
    // Clear session and settings
    localStorage.removeItem('rw_roadmap_status')
    localStorage.removeItem('rw_app_settings')
    clearSession()
    
    window.location.href = '/'
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366F1] block mb-2">
          System Configuration
        </span>
        <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
          Application <span className="text-gray-500 italic">Settings</span>
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Category Links (Readonly / Visual styling) */}
        <div className="md:col-span-1 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#6366F1] bg-[#6366F1]/5 border border-[#6366F1]/20 font-mono">
              ✓ General Settings
            </button>
            <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-all font-mono">
              API Routing
            </button>
            <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-all font-mono">
              Notifications
            </button>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5">
            <button 
              onClick={handleClearCache}
              className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-500/25 text-red-400 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Reset Terminal
            </button>
          </div>
        </div>

        {/* Right Side: Form Controls */}
        <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">System Toggles</h3>

          {saveSuccess && (
            <div className="mb-6 p-3 bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs rounded-xl text-center font-bold uppercase tracking-wide">
              Configurations Synchronized Successfully
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Mock Backend Mode */}
            <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-6 opacity-50">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Local Mock Service Fallback (Disabled)</h4>
                <p className="text-xs text-gray-500 leading-normal max-w-sm">
                  This environment is locked to the live Flask production backend. Sandboxed simulation is unavailable.
                </p>
              </div>
              <input 
                type="checkbox"
                checked={false}
                disabled
                className="w-10 h-6 rounded-full border-white/10 bg-white/5 text-gray-600 cursor-not-allowed opacity-50 shadow-inner"
              />
            </div>

            {/* Particles Toggle */}
            <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Interactive Shader Background</h4>
                <p className="text-xs text-gray-500 leading-normal max-w-sm">
                  Enable dynamic WebGL particle matrix domain-warping background animations.
                </p>
              </div>
              <input 
                type="checkbox"
                checked={particles}
                onChange={(e) => setParticles(e.target.checked)}
                className="w-10 h-6 rounded-full border-white/20 bg-[#121212] text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-black cursor-pointer shadow-inner"
              />
            </div>

            {/* Animation Speed scale */}
            <div className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">Transition Scale Ratio</h4>
                <span className="text-xs text-[#6366F1] font-mono font-bold">{animationSpeed}x</span>
              </div>
              <p className="text-xs text-gray-500 leading-normal mb-4">
                Scales page transformation vectors and loading sequence timings.
              </p>
              <input 
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#6366F1] cursor-ew-resize bg-white/10 rounded-full h-1"
              />
            </div>

            {/* Save trigger */}
            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-[#6366F1] text-[#00173b] px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Apply Configs
              </button>
              <Link 
                to="/dashboard"
                className="bg-white/5 border border-white/10 text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Exit
              </Link>
            </div>

          </form>
        </div>

      </div>

    </div>
  )
}

