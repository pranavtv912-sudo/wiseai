import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PaymentModal({ isOpen, invoice, amountSats, preimage, onPaymentSuccess, onClose }) {
  const [copied, setCopied] = useState(false)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [manualPreimage, setManualPreimage] = useState('')
  const [tab, setTab] = useState('qr') // 'qr' or 'manual'

  useEffect(() => {
    if (isOpen) {
      setPaying(false)
      setSuccess(false)
      setCopied(false)
      setManualPreimage('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSimulatePayment = () => {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setSuccess(true)
      setTimeout(() => {
        onPaymentSuccess(preimage)
      }, 1000)
    }, 1500)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualPreimage.trim()) {
      // If user inputs a transaction ID for Algorand or Lightning preimage, pass it through
      onPaymentSuccess(manualPreimage.trim())
    }
  }



  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20 text-[#6366F1]">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide uppercase">Dossier Micropayment</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">HTTP 402 Required</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {/* Payment Screen */}
          <div className="p-6 flex flex-col items-center">
            {success ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center mb-6 text-[#6366F1] shadow-[0_0_30px_rgba(99, 102, 241,0.2)]">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h4 className="text-white font-bold text-lg mb-1">Payment Verified!</h4>
                <p className="text-xs text-gray-400">Cryptographic proof acquired. Unleashing analysis...</p>
              </motion.div>
            ) : paying ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-2 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin mb-6"></div>
                <h4 className="text-white font-bold text-sm tracking-wide uppercase">Verifying Transaction...</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sourcing ledger confirmations</p>
              </div>
            ) : (
              <>
                {/* Cost Indicator */}
                <div className="bg-[#6366F1]/5 border border-[#6366F1]/10 px-5 py-3 rounded-2xl flex items-center justify-between w-full mb-6">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Cost Per Analysis</span>
                  <div className="text-right">
                    <span className="text-[#6366F1] font-bold text-lg">
                      {amountSats}
                    </span>
                    <span className="text-xs text-gray-400 font-bold ml-1.5 uppercase">
                      Sats
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl w-full mb-6">
                  <button 
                    onClick={() => setTab('qr')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      tab === 'qr' ? 'bg-[#6366F1] text-[#00173b]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Lightning QR
                  </button>
                  <button 
                    onClick={() => setTab('manual')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      tab === 'manual' ? 'bg-[#6366F1] text-[#00173b]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Manual Proof
                  </button>
                </div>

                {tab === 'qr' && (
                  <div className="flex flex-col items-center w-full">
                    {/* Simulated QR Code */}
                    <div className="p-4 bg-white rounded-2xl mb-6 shadow-lg relative group">
                      <svg className="w-40 h-40" viewBox="0 0 100 100">
                        <path d="M10 10h20v20H10zm0 50h20v20H10zm50-50h20v20H60z" fill="#000" />
                        <path d="M15 15h10v10H15zm0 50h10v10H15zm50-50h10v10H65z" fill="#fff" />
                        <path d="M35 15h15v5H35zm0 10h10v5H35zm15 10h20v5H50z" fill="#000" />
                        <path d="M20 35h5v15h-5zm15 15h5v10h-5zm10-5h10v5H45zm15 15h10v5H60zm5-15h10v5H65z" fill="#000" />
                        <path d="M10 80h10v10H10zm20 0h10v10H30zm40 10h20V80H70z" fill="#000" />
                      </svg>
                      <div className="absolute inset-0 bg-[#6366F1]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-2xl cursor-pointer p-4" onClick={handleSimulatePayment}>
                        <span className="material-symbols-outlined text-4xl text-[#00173b] animate-bounce">wallet</span>
                        <span className="text-[10px] font-bold text-[#00173b] uppercase tracking-widest mt-2">Pay via WebLN</span>
                      </div>
                    </div>

                    {/* Invoice Copy Field */}
                    <div className="relative w-full mb-6">
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-24 text-[10px] text-gray-400 font-mono focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCopy(invoice)}
                        className="absolute right-2.5 top-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Simulation / Payment Button */}
                    <button 
                      onClick={handleSimulatePayment}
                      className="w-full bg-[#6366F1] text-[#00173b] py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">bolt</span>
                      <span>Pay Invoice (Simulate Wallet)</span>
                    </button>
                  </div>
                )}

                {tab === 'manual' && (
                  <form onSubmit={handleManualSubmit} className="w-full">
                    <p className="text-[11px] text-gray-400 mb-4">
                      Submit a confirmed proof of transaction manually. You can supply a 64-char Lightning Hex preimage.
                    </p>
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Payment Proof (Preimage)
                      </label>
                      <input 
                        type="text" 
                        value={manualPreimage}
                        onChange={(e) => setManualPreimage(e.target.value)}
                        placeholder="e.g. 7f9b8a3c2e1..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white font-mono placeholder:text-gray-700 focus:border-[#6366F1]/50 focus:outline-none transition-all"
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={manualPreimage.length < 10}
                      className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-30"
                    >
                      Submit & Verify Proof
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

