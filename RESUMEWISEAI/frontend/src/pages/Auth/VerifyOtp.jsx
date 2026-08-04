import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifySignupOtp, resendOtp } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function VerifyOtp() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const email = searchParams.get('email') || ''
  const purpose = searchParams.get('purpose') || 'register'

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  // 5-minute (300 seconds) countdown timer for OTP validity
  const [timeLeft, setTimeLeft] = useState(300)

  // 60-second cooldown timer for resending OTP
  const [resendCooldown, setResendCooldown] = useState(60)

  useEffect(() => {
    if (!email) {
      setError('Invalid verification context. Missing email.')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email])

  useEffect(() => {
    if (resendCooldown <= 0) return

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(cooldownTimer)
  }, [resendCooldown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit numeric verification code.')
      return
    }

    if (timeLeft <= 0) {
      setError('This verification code has expired. Please request a new one.')
      return
    }

    setSubmitting(true)
    try {
      const result = await verifySignupOtp(email, otp)
      if (result.success && result.data) {
        setSuccess('Security credentials verified successfully!')
        setTimeout(() => {
          loginUser(result.data.user)
          navigate('/dashboard')
        }, 1500)
      } else {
        setError(result.message || 'Verification failed')
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code or server error.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return
    
    setError('')
    setSuccess('')
    setResending(true)
    try {
      const result = await resendOtp(email, purpose)
      if (result.success) {
        setSuccess('A new verification code has been dispatched.')
        setTimeLeft(300) // Reset 5-minute validity timer
        setResendCooldown(60) // Reset 60-second cooldown timer
      } else {
        setError(result.message || 'Failed to resend code.')
      }
    } catch (err) {
      setError(err.message || 'Resend request failed. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <header className="text-center mb-8">
        <h2 className="text-2xl font-bold vanguard-heading tracking-tight mb-2">Verify Identity</h2>
        <p className="text-gray-400 text-xs">
          A secure transmission was sent to <span className="text-white font-semibold">{email}</span>. Input the OTP below.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1] text-xs rounded-lg text-center font-bold uppercase tracking-wider">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* OTP Input */}
        <div className="relative group text-center">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#6366F1] transition-colors duration-200">
            6-Digit Verification Code
          </label>
          <div className="relative mt-3 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#6366F1]/40 group-focus-within:ring-1 group-focus-within:ring-[#6366F1]/20">
            <input 
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              className="w-full bg-transparent border-0 rounded-lg text-2xl font-bold tracking-[0.5em] text-center px-4 py-4 text-white placeholder:text-gray-700 focus:ring-0 focus:outline-none" 
              placeholder="000000" 
              type="text" 
              pattern="\d{6}"
              maxLength="6"
              required
            />
          </div>
        </div>

        {/* Timer Displays */}
        <div className="flex justify-between items-center text-xs text-gray-400 px-1 font-mono">
          <div>
            Code Expiry: <span className={`font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-[#6366F1]'}`}>{formatTime(timeLeft)}</span>
          </div>
          <div>
            {resendCooldown > 0 ? (
              <span>Resend in: <span className="text-white font-bold">{resendCooldown}s</span></span>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                disabled={resending}
                className="text-[#6366F1] hover:underline font-bold transition-all uppercase text-[10px]"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={submitting || timeLeft <= 0}
          className="w-full bg-white hover:bg-[#6366F1] text-black font-bold py-3.5 rounded-lg transition-all duration-300 text-sm mt-8 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_20px_rgba(99, 102, 241,0.3)] disabled:opacity-30 disabled:hover:bg-white disabled:hover:scale-100 disabled:cursor-not-allowed" 
        >
          {submitting ? 'Confirming...' : 'Verify & Synchronize'}
        </button>

      </form>
    </>
  )
}

