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
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    logoutUser()
    navigate('/')
  }

  // PUBLIC NAVBAR ITEMS (Not Logged In)
  const publicNavItems = [
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/#features' }
  ]

  // AUTHENTICATED APPLICATION NAVBAR ITEMS (Logged In)
  const appNavItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Resume Builder', path: '/resume-builder' },
    { name: 'ATS Analysis', path: '/analysis' },
    { name: 'JD Match', path: '/jd-match' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Interview AI', path: '/interview' },
    { name: 'Resources', path: '/resources' }
  ]

  return (
    <>
      {/* Wrapper to center the floating glass navbar */}
      <div className="fixed top-5 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between w-full max-w-[1180px] h-16 px-6 rounded-full border transition-all duration-500 ${
            scrolled
              ? 'bg-[#0A0E16]/80 border-white/[0.12] backdrop-blur-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] scale-[0.98]'
              : 'bg-[#0A0E16]/45 border-white/[0.08] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-['Manrope',sans-serif] font-bold text-lg md:text-xl tracking-[0.05em] text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFF] shadow-[0_0_12px_#4D7CFF] animate-pulse"></span>
            ResumeWise AI
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {authenticated ? (
              // AUTHENTICATED MENUS
              appNavItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="relative px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-400 hover:text-white transition-colors duration-300 rounded-full"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(77,124,255,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="relative z-10 block"
                    >
                      {item.name}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-white/[0.04] border border-white/[0.08] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      >
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#4D7CFF] rounded-full shadow-[0_0_8px_#4D7CFF]"></span>
                      </motion.div>
                    )}
                  </NavLink>
                )
              })
            ) : (
              // PUBLIC MENUS (Only About & Features)
              publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path.startsWith('/#') ? '/' : item.path}
                  className="relative px-4 py-1.5 text-xs font-semibold tracking-wide text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <span className="relative z-10 block">{item.name}</span>
                </Link>
              ))
            )}
          </div>

          {/* Right Action Options */}
          <div className="hidden lg:flex items-center gap-4">
            {authenticated ? (
              // AUTHENTICATED USER RIGHT OPTIONS (Profile & Logout)
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:border-[#4D7CFF]/50 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#4D7CFF] to-[#7097FF] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <span className="text-xs font-medium text-gray-200 max-w-[100px] truncate">
                    {user?.name || 'Profile'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs font-bold uppercase tracking-widest text-[#4D7CFF] hover:text-white transition-all duration-300 relative group py-1"
                >
                  <span className="relative z-10">Logout</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4D7CFF] group-hover:w-full transition-all duration-300 shadow-[0_0_8px_#4D7CFF]"></span>
                </button>
              </div>
            ) : (
              // PUBLIC RIGHT OPTIONS (Sign In & Get Started)
              <div className="flex items-center gap-4">
                <Link
                  to="/signin"
                  className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#4D7CFF] hover:bg-[#3B6AE6] text-white px-5 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(77,124,255,0.3)] hover:shadow-[0_4px_25px_rgba(77,124,255,0.6)] hover:scale-[1.03]"
                >
                  Get Started
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Toggle (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden text-white hover:text-[#4D7CFF] focus:outline-none transition-colors duration-300"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </motion.nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-[9999] bg-[#0A0E16]/95 border-l border-white/10 backdrop-blur-2xl lg:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-['Manrope'] font-bold text-white text-base">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFF]"></span>
                  ResumeWise AI
                </Link>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
                {(authenticated ? appNavItems : publicNavItems).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/[0.04] hover:text-white transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-4">
                {authenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#4D7CFF] flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user?.name ? user.name[0] : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">{user?.name || 'Profile'}</span>
                        <span className="text-[10px] text-gray-500 truncate">{user?.email}</span>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-[#4D7CFF]/15 hover:bg-[#4D7CFF] hover:text-white text-[#4D7CFF] py-3 rounded-xl text-sm font-bold transition-all border border-[#4D7CFF]/30"
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
                      className="w-full bg-[#4D7CFF] text-white py-3 rounded-xl text-center text-sm font-medium transition-all"
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
