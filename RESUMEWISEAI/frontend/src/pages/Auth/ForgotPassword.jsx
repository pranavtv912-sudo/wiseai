import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword, resetPassword, resendOtp } from '../../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  // 5-minute validity timer
  const [timeLeft, setTimeLeft] = useState(300)
  // 60-second resend cooldown
  const [resendCooldown, setResendCooldown] = useState(60)

  useEffect(() => {
    if (step !== 2) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(cooldownTimer)
    }
  }, [step, resendCooldown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please supply a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const result = await forgotPassword(email)
      if (result.success) {
        setSuccess('Security verification code sent successfully!')
        setTimeout(() => {
          setSuccess('')
          setStep(2)
          setTimeLeft(300)
          setResendCooldown(60)
        }, 1500)
      } else {
        setError(result.message || 'Verification initialization failed.')
      }
    } catch (err) {
      setError(err.message || 'Email address not registered or server error.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter the 6-digit numeric verification code.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (timeLeft <= 0) {
      setError('The verification code has expired. Please request a new one.')
      return
    }

    setSubmitting(true)
    try {
      const result = await resetPassword(email, otp, newPassword)
      if (result.success) {
        setSuccess('Access Key successfully updated. Redirecting to login...')
        setTimeout(() => {
          navigate('/signin')
        }, 2000)
      } else {
        setError(result.message || 'Failed to reset password.')
      }
    } catch (err) {
      setError(err.message || 'Verification check failed. Please check your code.')
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
      const result = await resendOtp(email, 'forgot_password')
      if (result.success) {
        setSuccess('A new verification code has been dispatched.')
        setTimeLeft(300)
        setResendCooldown(60)
      } else {
        setError(result.message || 'Failed to send new code.')
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
        <h2 className="text-2xl font-bold vanguard-heading tracking-tight mb-2">
          {step === 1 ? 'Recover Credentials' : 'Configure Access'}
        </h2>
        <p className="text-gray-400 text-xs">
          {step === 1 
            ? 'Enter your registered email address to receive an authentication OTP.' 
            : 'Enter the verification code and configure your new secure password.'
          }
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

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
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

          {/* Submit */}
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-white hover:bg-[#6366F1] text-black font-bold py-3.5 rounded-lg transition-all duration-300 text-sm mt-8 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50" 
          >
            {submitting ? 'Initializing...' : 'Transmit Verification Code'}
          </button>
          
          <div className="text-center mt-6">
            <Link to="/signin" className="text-xs text-gray-400 hover:text-white transition-colors">
              Return to Login Portal
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* OTP Input */}
          <div className="relative group text-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#6366F1] transition-colors duration-200">
              6-Digit Verification Code
            </label>
            <div className="relative mt-2 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#6366F1]/40 group-focus-within:ring-1 group-focus-within:ring-[#6366F1]/20">
              <input 
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                className="w-full bg-transparent border-0 rounded-lg text-xl font-bold tracking-[0.5em] text-center px-4 py-3.5 text-white placeholder:text-gray-700 focus:ring-0 focus:outline-none" 
                placeholder="000000" 
                type="text" 
                pattern="\d{6}"
                maxLength="6"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-[#6366F1] transition-colors duration-200">
              Configure New Access Key
            </label>
            <div className="relative mt-1.5 rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-focus-within:border-[#6366F1]/40 group-focus-within:ring-1 group-focus-within:ring-[#6366F1]/20">
              <input 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
          </div>

          {/* Timer Display */}
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

          {/* Submit */}
          <button 
            type="submit"
            disabled={submitting || timeLeft <= 0}
            className="w-full bg-white hover:bg-[#6366F1] text-black font-bold py-3.5 rounded-lg transition-all duration-300 text-sm mt-8 flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30" 
          >
            {submitting ? 'Resetting...' : 'Update Credentials'}
          </button>
        </form>
      )}
    </>
  )
}

