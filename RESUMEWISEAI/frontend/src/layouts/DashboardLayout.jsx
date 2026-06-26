import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WebGLBackground from '../components/WebGLBackground'
import AIChatAssistant from '../components/AIChatAssistant'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const { authenticated } = useAuth()

  return (
    <div className="min-h-screen text-white bg-[#050505] relative flex flex-col font-sans overflow-x-hidden">
      {/* Background Interactive Shader */}
      <WebGLBackground />
      
      {/* Shared Navigation Header */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Floating AI Assistant */}
      {authenticated && <AIChatAssistant />}
    </div>
  )
}
