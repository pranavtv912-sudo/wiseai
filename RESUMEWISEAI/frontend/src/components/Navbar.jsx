import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, authenticated, logoutUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    logoutUser()
    navigate('/')
  }

  const baseItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' }
  ]

  const authItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Interview', path: '/interview' },
    { name: 'Resources', path: '/resources' },
    { name: 'JD Match', path: '/jd-match' },
    { name: 'Resume Builder', path: '/resume-builder' },
    { name: 'Analytics', path: '/analytics' }
  ]

  const activeLinks = authenticated ? [...baseItems, ...authItems] : baseItems

  return (
    <>
      {/* Wrapper to center the floating navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between w-full max-w-7xl h-16 px-6 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-[#0A0A0A]/80 border-white/[0.08] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]'
              : 'bg-[#0A0A0A]/55 border-white/[0.05] backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-sans font-extrabold tracking-tight text-white text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
            ResumeWise AI
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {activeLinks.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-400 hover:text-white transition-colors duration-300 rounded-full"
                >
                  <motion.span
                    whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(59,130,246,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 block"
                  >
                    {item.name}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-white/[0.03] border border-white/[0.05] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    >
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#3B82F6] rounded-full"></span>
                    </motion.div>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Right Side Options */}
          <div className="hidden lg:flex items-center gap-4">
            {authenticated ? (
              <div className="flex items-center gap-4">
                {/* Profile Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-[10px] font-bold text-[#00173b] uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <span className="text-xs font-medium text-gray-300 max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                </div>

                {/* Settings Icon */}
                <Link to="/settings" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <motion.span
                    whileHover={{ rotate: 45 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="material-symbols-outlined text-[20px]"
                  >
                    settings
                  </motion.span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] hover:text-[#34d399] transition-all duration-300 relative group"
                >
                  <span className="relative z-10">Logout</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3B82F6] group-hover:w-full transition-all duration-300 shadow-[0_0_8px_#3B82F6]"></span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/signin" className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-white hover:bg-[#3B82F6] hover:text-black text-black px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.25)]"
                >
                  Get Started
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden text-white hover:text-[#3B82F6] focus:outline-none transition-colors duration-300"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </motion.nav>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 bg-[#0A0A0A]/95 border-l border-white/10 backdrop-blur-2xl lg:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-sans font-extrabold tracking-tight text-white text-base">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                  ResumeWise AI
                </Link>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
                {activeLinks.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
                          : 'text-gray-300 hover:bg-white/[0.03] hover:text-white border border-transparent'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-4">
                {authenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-xs font-bold text-[#00173b] uppercase shrink-0">
                        {user?.name ? user.name[0] : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                        <span className="text-[10px] text-gray-500 truncate">{user?.email}</span>
                      </div>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-[#3B82F6]/10 hover:bg-[#3B82F6] hover:text-black text-[#3B82F6] py-3 rounded-xl text-sm font-bold transition-all duration-300 border border-[#3B82F6]/20"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center text-gray-300 hover:text-white py-2 text-sm font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-white hover:bg-[#3B82F6] hover:text-black text-black py-3 rounded-xl text-center text-sm font-bold transition-all duration-300"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

