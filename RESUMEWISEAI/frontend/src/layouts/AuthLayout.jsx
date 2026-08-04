import { Outlet } from 'react-router-dom'
import WebGLBackground from '../components/WebGLBackground'
import CubeCanvas from '../components/CubeCanvas'

export default function AuthLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans antialiased text-white relative bg-[#050505] overflow-x-hidden">
      {/* WebGL domain warping background */}
      <WebGLBackground />

      {/* Main app card */}
      <main className="flex flex-col md:flex-row w-full max-w-5xl bg-black/45 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,78,59,0.15)] border border-white/10 z-10">
        
        {/* Left Panel: Hero & Stats/Stepper */}
        <section className="w-full md:w-1/2 bg-gradient-to-br from-[#064e3b]/15 to-transparent p-10 md:p-16 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-white/10 min-h-[400px] md:min-h-[600px] overflow-hidden">
          {/* 3D Rotating Cube Canvas */}
          <CubeCanvas className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse shadow-[0_0_8px_rgba(99, 102, 241,0.8)]"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300">VANGUARD SHIELD</span>
            </div>
          </div>

          {/* Mid Content */}
          <div className="mt-8 md:mt-12 relative z-10">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-tight vanguard-heading text-white">
              Welcome to the<br /><span className="text-[#6366F1] italic font-bold">Elite.</span>
            </h1>
            <p className="text-gray-300 text-sm max-w-xs leading-relaxed">
              Initialize your credentials to access your career neural network and tactical dossier.
            </p>
          </div>

          {/* Bottom Stats / Stepper info */}
          <div className="mt-12 grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-all duration-300 group hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold leading-tight text-white/40 uppercase tracking-wider">ATS Fidelity</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99, 102, 241,0.8)]"></span>
              </div>
              <div className="text-2xl font-bold text-[#6366F1] vanguard-heading">99.8%</div>
              <div className="text-[9px] text-gray-500 mt-1">Real-time feedback loop</div>
            </div>
            <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-all duration-300 group hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold leading-tight text-white/40 uppercase tracking-wider">Nodes Scanned</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99, 102, 241,0.8)]"></span>
              </div>
              <div className="text-2xl font-bold text-[#6366F1] vanguard-heading">14.2k</div>
              <div className="text-[9px] text-gray-500 mt-1">Global framework sync</div>
            </div>
          </div>
        </section>

        {/* Right Panel: Render child pages (Login/Register) */}
        <section className="w-full md:w-1/2 bg-black/20 p-10 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <Outlet />
          </div>
        </section>

      </main>
    </div>
  )
}

