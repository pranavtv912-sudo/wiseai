import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!terms) {
      setError('You must accept the Strategic Protocol')
      return
    }

    setSubmitting(true)
    const fullName = `${firstName} ${lastName}`.trim()
    try {
      const result = await register(fullName, email, password)
      if (result.success) {
        navigate('/signin')
      } else {
        setError(result.message || 'Registration failed')
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
        <h2 className="text-2xl font-bold vanguard-heading tracking-tight mb-2">Sign Up Account</h2>
        <p className="text-gray-400 text-xs">Enter your personal details to begin.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#4edea3] transition-colors duration-200">First Name</label>
            <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#4edea3]/40 group-focus-within:ring-1 group-focus-within:ring-[#4edea3]/20">
              <input 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none" 
                placeholder="eg. John" 
                type="text" 
                required
              />
            </div>
          </div>
          {/* Last Name */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#4edea3] transition-colors duration-200">Last Name</label>
            <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#4edea3]/40 group-focus-within:ring-1 group-focus-within:ring-[#4edea3]/20">
              <input 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none" 
                placeholder="eg. Francisco" 
                type="text" 
                required
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="relative group">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#4edea3] transition-colors duration-200">Email Address</label>
          <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#4edea3]/40 group-focus-within:ring-1 group-focus-within:ring-[#4edea3]/20">
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none" 
              placeholder="eg. johnfrans@gmail.com" 
              type="email" 
              required
            />
          </div>
        </div>
        
        {/* Password */}
        <div className="relative group">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#4edea3] transition-colors duration-200">Password</label>
          <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#4edea3]/40 group-focus-within:ring-1 group-focus-within:ring-[#4edea3]/20">
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 rounded-lg text-sm px-4 py-3 text-white placeholder:text-gray-600 focus:ring-0 focus:outline-none pr-10" 
              placeholder="Enter secure password" 
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
          <p className="text-[10px] text-gray-500 mt-1">Must be at least 8 characters.</p>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <input 
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-[#121212] text-[#4edea3] focus:ring-[#4edea3] focus:ring-offset-black cursor-pointer bg-white/[0.02]" 
            id="terms" 
            type="checkbox" 
            required
          />
          <label className="text-xs text-gray-400 cursor-pointer" htmlFor="terms">
            I accept the <a className="text-white hover:text-[#4edea3] hover:underline transition-colors font-bold" href="#">Strategic Protocol</a>.
          </label>
        </div>

        {/* Submit */}
        <button 
          disabled={submitting}
          className="w-full bg-white hover:bg-[#4edea3] text-black font-bold py-3.5 rounded-lg transition-all duration-300 text-sm mt-6 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_20px_rgba(78,222,163,0.3)] group disabled:opacity-50" 
          type="submit"
        >
          <span className="flex items-center gap-2">
            <span>{submitting ? 'Creating Profile...' : 'Sign Up'}</span>
            {!submitting && <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>}
          </span>
        </button>
      </form>

      <footer className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Already have an account? <Link className="text-white hover:text-[#4edea3] font-bold hover:underline transition-colors ml-1" to="/signin">Log In</Link>
        </p>
      </footer>
    </>
  )
}
