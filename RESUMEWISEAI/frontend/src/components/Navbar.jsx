import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, authenticated, logoutUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const activeClass = "text-[#4edea3] font-medium border-b-2 border-[#4edea3] pb-1 text-sm font-body-md"
  const inactiveClass = "text-gray-400 hover:text-white transition-colors text-sm font-body-md"

  return (
    <>
      <nav className="bg-[#050505]/40 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto py-4">
          <Link to="/" className="vanguard-heading text-2xl font-bold tracking-tighter text-white">
            ResumeWise AI
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={({ isActive }) => isActive ? activeClass : inactiveClass} end>
              Home
            </NavLink>
            {authenticated && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/roadmap" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Roadmap
                </NavLink>
                <NavLink to="/interview" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Interview
                </NavLink>
                <NavLink to="/resources" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Resources
                </NavLink>
                <NavLink to="/jd-match" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  JD Match
                </NavLink>
                <NavLink to="/resume-builder" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Resume Builder
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  Analytics
                </NavLink>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {authenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-xs text-gray-300 font-medium bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                  {user?.name || 'Operative'}
                </Link>
                <Link to="/settings" className="text-gray-400 hover:text-white transition-colors flex items-center" title="Settings">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold uppercase tracking-widest text-[#4edea3] hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="island-button bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold flex items-center group transition-all duration-300 hover:bg-[#4edea3]"
                >
                  Get Started
                  <span className="ml-2 w-5 h-5 bg-black/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden text-white hover:text-[#4edea3] focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 z-40 bg-[#050505]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out md:hidden border-b border-white/10 shadow-2xl top-[65px]">
          <div className="flex flex-col p-8 space-y-6">
            <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/">
              Home
            </Link>
            {authenticated && (
              <>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/dashboard">
                  Dashboard
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/roadmap">
                  Roadmap
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/interview">
                  Interview
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/resources">
                  Resources
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/jd-match">
                  JD Match
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/resume-builder">
                  Resume Builder
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/analytics">
                  Analytics
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/profile">
                  Profile
                </Link>
                <Link onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#4edea3] text-lg" to="/settings">
                  Settings
                </Link>
              </>
            )}
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex flex-col gap-4">
              {authenticated ? (
                <>
                  <span className="text-gray-400 text-sm">Active: {user?.name || 'Operative'}</span>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="island-button bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full text-center font-bold text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link onClick={() => setIsOpen(false)} to="/signin" className="text-gray-400 hover:text-white text-center py-2 text-sm">
                    Sign In
                  </Link>
                  <Link
                    onClick={() => setIsOpen(false)}
                    to="/signup"
                    className="island-button bg-white text-black px-6 py-3 rounded-full text-center font-bold text-sm hover:bg-[#4edea3]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
