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
      {/* Background Interactive Shader */}
      <WebGLBackground />
      
      {/* Shared Navigation Header */}
      <Navbar />

      {/* Page Content with dynamic top padding to clear the floating navbar */}
      <main className="flex-1 flex flex-col relative z-10" style={{ paddingTop: isLanding ? '0px' : 'var(--navbar-height)' }}>
        <Outlet />
      </main>

      {/* Floating AI Assistant */}
      {authenticated && <AIChatAssistant />}
    </div>
  )
}

