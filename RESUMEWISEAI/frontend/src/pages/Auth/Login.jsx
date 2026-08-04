import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.success && result.data) {
        loginUser(result.data.user)
        navigate('/dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="text-center mb-8">
        <h2 className="text-2xl font-bold vanguard-heading tracking-tight mb-2">Sign In Account</h2>
        <p className="text-gray-400 text-xs">Enter your personal credentials to continue.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email field */}
        <div className="relative group">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#6366F1] transition-colors duration-200">
            Email Address
          </label>
          <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#6366F1]/40 group-focus-within:ring-1 group-focus-within:ring-[#6366F1]/20">
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none" 
              placeholder="eg. strategist@vanguard.ai" 
              type="email" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="relative group">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#6366F1] transition-colors duration-200">
              Password
            </label>
            <Link className="text-[10px] text-[#6366F1]/80 hover:text-[#6366F1] hover:underline transition-colors font-medium" to="/forgot-password">
              Recover Key
            </Link>
          </div>
          <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#6366F1]/40 group-focus-within:ring-1 group-focus-within:ring-[#6366F1]/20">
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none pr-10" 
              placeholder="Enter password" 
              type={showPassword ? "text" : "password"} 
              required
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button 
          disabled={submitting}
          className="w-full bg-white hover:bg-[#6366F1] text-black font-bold py-3.5 rounded-lg transition-all duration-300 text-sm mt-8 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_20px_rgba(99, 102, 241,0.3)] group disabled:opacity-50" 
          type="submit"
        >
          <span className="flex items-center gap-2">
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            {!submitting && <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>}
          </span>
        </button>
      </form>

      <footer className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          New operative? <Link className="text-white hover:text-[#6366F1] font-bold hover:underline transition-colors ml-1" to="/signup">Create Account</Link>
        </p>
      </footer>
    </>
  )
}

