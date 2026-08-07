import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WebGLBackground from '../components/WebGLBackground'
import AIChatAssistant from '../components/AIChatAssistant'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const { authenticated } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen text-white bg-[#050505] relative flex flex-col font-sans overflow-x-hidden">
      {/* Background Interactive Shader (hide on landing so HTML video is visible) */}
      {!isLanding && <WebGLBackground />}
      
      {/* Shared Navigation Header */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 flex flex-col relative z-10 pt-24">
        <Outlet />
      </main>

      {/* Floating AI Assistant */}
      {authenticated && <AIChatAssistant />}
    </div>
  )
}
