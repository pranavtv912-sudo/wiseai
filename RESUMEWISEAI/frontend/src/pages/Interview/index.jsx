import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  generateInterviewQuestions, 
  generateResumeBasedQuestions, 
  getTechnicalQuestions, 
  getBehavioralQuestions, 
  getRoles,
  evaluateInterviewAnswer 
} from '../../services/api'

const TOPIC_QUESTIONS = {
  'React': [
    "What is the difference between useEffect and useLayoutEffect, and when should you use each?",
    "Explain how React's virtual DOM reconciliation algorithm works.",
    "How does context state compare to global state managers like Redux or Zustand in terms of re-rendering?"
  ],
  'System Design': [
    "How would you design a rate limiter for a public-facing API?",
    "Explain the trade-offs between consistency and availability in a distributed cache network.",
    "What strategies would you employ to handle hot partitions in a database cluster?"
  ],
  'Python': [
    "Explain how Python's memory management works, specifically referencing reference counting and garbage collection.",
    "What are decorators, and how would you build a decorator that retries a network call upon failure?",
    "Describe the difference between multiprocessing and multithreading in Python, considering the GIL."
  ],
  'JavaScript': [
    "Explain closures in JavaScript.",
    "What is hoisting?",
    "Explain the event loop."
  ],
  'SQL': [
    "Explain the difference between INNER JOIN and LEFT JOIN.",
    "What are indexes and why are they important?",
    "Explain normalization."
  ]
}

const DEFAULT_QUESTIONS = [
  "Describe a challenging technical project you worked on and the architectural decisions you made.",
  "How do you approach debugging complex performance bottlenecks in a web application?",
  "What is your strategy for writing maintainable, clean code while working within tight deadlines?"
]

export default function Interview() {
  const [searchParams] = useSearchParams()
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [chatLog, setChatLog] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [interviewFinished, setInterviewFinished] = useState(false)
  const [scores, setScores] = useState({ clarity: 0, technical: 0, overall: 0 })
  const [feedbacks, setFeedbacks] = useState([])

  // Selection states
  const [interviewType, setInterviewType] = useState('resume') // 'resume', 'technical', 'behavioral'
  const [experienceLevel, setExperienceLevel] = useState('mid') // 'junior', 'mid', 'senior'
  const [questionCount, setQuestionCount] = useState(3) // 3, 5, 10
  const [skillFocus, setSkillFocus] = useState('React')
  const [targetRole, setTargetRole] = useState('')
  const [resumeId, setResumeId] = useState(null)
  const [roles, setRolesList] = useState([])

  // Parse topic query if exists
  useEffect(() => {
    const activeResumeId = localStorage.getItem('rw_last_analyzed_id')
    setResumeId(activeResumeId)
    
    const activeRole = localStorage.getItem('rw_detected_track') || 'Software Developer'
    setTargetRole(activeRole)

    // Load available roles
    async function loadRoles() {
      try {
        const res = await getRoles()
        if (res.success && res.data?.roles) {
          setRolesList(res.data.roles)
        }
      } catch (err) {
        console.error('Failed to load roles:', err)
      }
    }
    loadRoles()

    const t = searchParams.get('topic')
    if (t) {
      setInterviewType('technical')
      // Find best match key
      const keys = Object.keys(TOPIC_QUESTIONS)
      const match = keys.find(k => k.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(k.toLowerCase()))
      if (match) {
        setSkillFocus(match)
      } else {
        setSkillFocus(t)
      }
    }
  }, [searchParams])

  const startInterview = async () => {
    setEvaluating(true)
    setInterviewStarted(true)
    setInterviewFinished(false)
    setFeedbacks([])
    setChatLog([{ type: 'ai', text: 'Initializing interview session and contacting the AI interlocutor...' }])

    let qList = []
    
    try {
      if (interviewType === 'resume') {
        if (resumeId) {
          const res = await generateResumeBasedQuestions(resumeId, targetRole)
          if (res.success && res.data?.questions?.length) {
            qList = res.data.questions
          }
        }
      } else if (interviewType === 'technical') {
        const res = await getTechnicalQuestions(skillFocus)
        if (res.success && res.data?.questions?.length) {
          qList = res.data.questions
        }
      } else if (interviewType === 'behavioral') {
        const res = await getBehavioralQuestions()
        if (res.success && res.data?.questions?.length) {
          qList = res.data.questions
        }
      }
    } catch (e) {
      console.warn('API error generating questions, falling back:', e)
    }

    if (qList.length === 0) {
      if (interviewType === 'technical') {
        qList = TOPIC_QUESTIONS[skillFocus] || DEFAULT_QUESTIONS
      } else {
        qList = DEFAULT_QUESTIONS
      }
    }

    const finalQuestions = qList.slice(0, questionCount)
    setQuestions(finalQuestions)
    setCurrentQuestionIndex(0)
    setChatLog([
      { 
        type: 'ai', 
        text: `Welcome to your mock interview on "${interviewType === 'resume' ? `Resume-Based (${targetRole})` : interviewType === 'technical' ? `Technical Focus: ${skillFocus}` : 'HR & Behavioral' }". Let's begin.\n\nLevel: ${experienceLevel.toUpperCase()} | Questions: ${questionCount}\n\nHere is your first question:\n\n${finalQuestions[0]}` 
      }
    ])
    setEvaluating(false)
  }

  const handleSendAnswer = async (e) => {
    e.preventDefault()
    if (!userAnswer.trim() || evaluating) return

    const currentQuestion = questions[currentQuestionIndex]
    const currentAns = userAnswer
    setUserAnswer('')
    
    // Add user's answer to chat
    setChatLog(prev => [...prev, { type: 'user', text: currentAns }])
    setEvaluating(true)

    try {
      const modeText = interviewType === 'resume' ? 'Resume-Based' : interviewType === 'technical' ? `Technical (${skillFocus})` : 'Behavioral';
      const aiResult = await evaluateInterviewAnswer(currentQuestion, currentAns, modeText);

      const nextIndex = currentQuestionIndex + 1
      const currentFeedback = {
        question: currentQuestion,
        answer: currentAns,
        correctness: aiResult.correctness || 'Evaluated',
        technicalAccuracy: aiResult.technicalAccuracy || 'Medium',
        completeness: aiResult.completeness || 'Evaluated',
        confidenceScore: aiResult.confidenceScore || 70,
        missingConcepts: aiResult.missingConcepts || [],
        suggestedBetterAnswer: aiResult.suggestedBetterAnswer || '',
        finalScore: aiResult.finalScore || 70,
        feedback: `${aiResult.correctness}. ${aiResult.missingConcepts?.length > 0 ? `Missing: ${aiResult.missingConcepts.join(', ')}.` : ''} Suggestion: ${aiResult.suggestedBetterAnswer}`
      }

      setFeedbacks(prev => [...prev, currentFeedback])

      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex)
        setChatLog(prev => [
          ...prev,
          { 
            type: 'ai', 
            text: `Feedback on your response:\n- Correctness: ${aiResult.correctness}\n- Tech Accuracy: ${aiResult.technicalAccuracy}\n- Completeness: ${aiResult.completeness}\n- Confidence Score: ${aiResult.confidenceScore}%\n- Final Score: ${aiResult.finalScore}/100\n\n${aiResult.missingConcepts?.length > 0 ? `*Missing Concepts:* ${aiResult.missingConcepts.join(', ')}\n` : ''}\n*Suggested Better Answer:* ${aiResult.suggestedBetterAnswer}\n\nLet's move to the next question:\n\n${questions[nextIndex]}` 
          }
        ])
      } else {
        const newFeedbacks = [...feedbacks, currentFeedback]
        
        // Calculate average scores based on structured feedback
        const avgOverall = Math.round(newFeedbacks.reduce((a, b) => a + b.finalScore, 0) / newFeedbacks.length)
        
        const avgTechnical = Math.round(newFeedbacks.reduce((a, b) => {
          const mapping = { "High": 90, "Medium": 70, "Low": 40, "None": 10 };
          return a + (mapping[b.technicalAccuracy] || b.finalScore);
        }, 0) / newFeedbacks.length)

        const avgCompleteness = Math.round(newFeedbacks.reduce((a, b) => {
          const mapping = { "Complete": 95, "Needs Elaboration": 65, "Incomplete": 30 };
          return a + (mapping[b.completeness] || b.finalScore);
        }, 0) / newFeedbacks.length)

        const avgConfidence = Math.round(newFeedbacks.reduce((a, b) => a + (b.confidenceScore || 70), 0) / newFeedbacks.length)

        setScores({ 
          clarity: avgCompleteness, 
          technical: avgTechnical, 
          overall: avgOverall,
          confidence: avgConfidence
        })
        
        setChatLog(prev => [
          ...prev,
          { 
            type: 'ai', 
            text: `Feedback on your response:\n- Correctness: ${aiResult.correctness}\n- Tech Accuracy: ${aiResult.technicalAccuracy}\n- Completeness: ${aiResult.completeness}\n- Confidence Score: ${aiResult.confidenceScore}%\n- Final Score: ${aiResult.finalScore}/100\n\n${aiResult.missingConcepts?.length > 0 ? `*Missing Concepts:* ${aiResult.missingConcepts.join(', ')}\n` : ''}\n*Suggested Better Answer:* ${aiResult.suggestedBetterAnswer}\n\nThank you. That concludes your mock interview session. Your final evaluation sheet has been prepared.` 
          }
        ])
        setInterviewFinished(true)
      }
    } catch (err) {
      console.error("Evaluation error:", err)
      setUserAnswer(currentAns)
      setChatLog(prev => [
        ...prev,
        { 
          type: 'ai', 
          text: `Evaluation failed: ${err.message || 'Error connecting to AI evaluation backend'}. Please check your backend server / Gemini API key configuration and try again.` 
        }
      ])
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-8 pb-32 pt-20 w-full relative z-10">
      
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4edea3] block mb-2">
            AI Interlocutor System
          </span>
          <h1 className="vanguard-heading text-4xl md:text-5xl font-bold text-white">
            Mock <span className="text-gray-500 italic">Interview</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Mode: <span className="text-white font-semibold font-mono">{interviewType === 'resume' ? 'Resume-Based' : interviewType === 'technical' ? `Technical (${skillFocus})` : 'Behavioral'}</span>
          </p>
        </div>
        <div>
          <Link to="/roadmap" className="island-button bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Return to Roadmap
          </Link>
        </div>
      </section>

      {/* Main Panel */}
      {!interviewStarted ? (
        <section className="bg-[#0A0A0A] border border-white/15 rounded-[2.2rem] p-10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#4edea3] text-3xl">forum</span>
          </div>
          <h3 className="vanguard-heading text-2xl font-bold text-white mb-4 text-center">Initialize Interview Protocol</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed text-center">
            Test your competencies dynamically. Configure your mock interview below to deliver structured technical, behavioral, or resume-specific questions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            
            {/* Interview Type Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Interview Type</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'resume', label: 'Resume-Based', desc: 'Tailored to your resume and experience' },
                  { value: 'technical', label: 'Technical Stack', desc: 'Deep dive into stack-specific concepts' },
                  { value: 'behavioral', label: 'HR / Behavioral', desc: 'Situational & behavioral STAR questions' }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setInterviewType(type.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      interviewType === type.value
                        ? 'bg-[#4edea3]/10 border-[#4edea3] text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{type.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Panel */}
            <div className="space-y-4">
              {/* Conditional Fields based on Interview Type */}
              {interviewType === 'resume' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Target Role</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#4edea3]/50 focus:outline-none transition-all cursor-pointer animate-fade-in"
                  >
                    {roles.length > 0 ? (
                      roles.map(r => (
                        <option key={r.id || r.name} value={r.name} className="bg-[#0A0A0A]">{r.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Software Developer" className="bg-[#0A0A0A]">Software Developer</option>
                        <option value="Python Developer" className="bg-[#0A0A0A]">Python Developer</option>
                        <option value="Frontend Developer" className="bg-[#0A0A0A]">Frontend Developer</option>
                        <option value="Fullstack Engineer" className="bg-[#0A0A0A]">Fullstack Engineer</option>
                        <option value="DevOps Engineer" className="bg-[#0A0A0A]">DevOps Engineer</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {interviewType === 'technical' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Select Skill focus</label>
                  <select 
                    value={skillFocus}
                    onChange={(e) => setSkillFocus(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#4edea3]/50 focus:outline-none transition-all cursor-pointer animate-fade-in"
                  >
                    <option value="React" className="bg-[#0A0A0A]">React / Frontend</option>
                    <option value="Python" className="bg-[#0A0A0A]">Python / Scripting</option>
                    <option value="JavaScript" className="bg-[#0A0A0A]">JavaScript</option>
                    <option value="SQL" className="bg-[#0A0A0A]">SQL Database Systems</option>
                  </select>
                </div>
              )}

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Experience Level</label>
                <div className="flex gap-2">
                  {['junior', 'mid', 'senior'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        experienceLevel === lvl
                          ? 'bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Question Count</label>
                <div className="flex gap-2">
                  {[3, 5, 10].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        questionCount === count
                          ? 'bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {count} Qs
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {interviewType === 'resume' && !resumeId && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-amber-400 text-xs flex gap-3 items-start animate-fade-in">
              <span className="material-symbols-outlined flex-shrink-0 text-lg mt-0.5">warning</span>
              <div>
                <strong className="block font-bold mb-0.5">No Resume Found</strong>
                Please upload a resume first to run a Resume-Based mock interview, or choose a Technical/Behavioral interview type above.
              </div>
            </div>
          )}

          <button 
            onClick={startInterview}
            disabled={interviewType === 'resume' && !resumeId}
            className="bg-[#4edea3] text-[#003824] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Commence Interview
          </button>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chat Interface Column */}
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[2rem] flex flex-col h-[520px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
              <span className="text-xs text-[#4edea3] font-bold tracking-widest uppercase">Live Session</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                {interviewFinished ? 'Session Done' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </span>
            </div>
            
            {/* Scrollable messages zone */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-thin">
              {chatLog.map((log, i) => (
                <div key={i} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border whitespace-pre-line ${
                      log.type === 'user' 
                        ? 'bg-[#4edea3]/10 border-[#4edea3]/20 text-white rounded-tr-none' 
                        : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none'
                    }`}
                  >
                    {log.text}
                  </div>
                </div>
              ))}
              
              {evaluating && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs font-mono text-[#4edea3] animate-pulse">
                    Evaluating response fidelity...
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Bar */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01]">
              {interviewFinished ? (
                <button 
                  onClick={() => setInterviewStarted(false)}
                  className="w-full bg-[#4edea3]/15 border border-[#4edea3]/20 text-[#4edea3] py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4edea3]/25 transition-all"
                >
                  Restart Session
                </button>
              ) : (
                <form onSubmit={handleSendAnswer} className="flex gap-3">
                  <input 
                    type="text" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={evaluating}
                    placeholder="Type your technical explanation here..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4edea3]/50 focus:ring-1 focus:ring-[#4edea3]/30 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={evaluating || !userAnswer.trim()}
                    className="bg-[#4edea3] text-[#003824] px-5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Real-time score analytics Column */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Evaluation Sheet</h3>
              
              {!interviewFinished ? (
                <div className="text-center py-16 text-gray-500 text-xs leading-relaxed font-mono">
                  <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">pending_actions</span>
                  Awaiting interview completion. Complete all {questions.length} questions to generate scorecard metrics.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score Dial */}
                  <div className="text-center bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                    <div className="text-3xl font-black font-mono text-[#4edea3] mb-1">{scores.overall}%</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Overall Score</div>
                  </div>

                  {/* Criteria Sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                        <span>Completeness & Clarity</span>
                        <span>{scores.clarity}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${scores.clarity}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                        <span>Technical Accuracy</span>
                        <span>{scores.technical}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4edea3]" style={{ width: `${scores.technical}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                        <span>Confidence Level</span>
                        <span>{scores.confidence || 70}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${scores.confidence || 70}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Feedback Summary list */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">AI Recommendations</div>
                    <div className="text-xs text-gray-400 leading-normal space-y-4 font-mono max-h-60 overflow-y-auto scrollbar-thin pr-1">
                      {feedbacks.map((f, i) => (
                        <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#4edea3]">
                            <span>Question {i+1}</span>
                            <span>Score: {f.finalScore}/100</span>
                          </div>
                          <div className="text-[10px] text-gray-500 space-y-1">
                            <div><strong className="text-gray-400">Correctness:</strong> {f.correctness}</div>
                            <div><strong className="text-gray-400">Technical Accuracy:</strong> {f.technicalAccuracy}</div>
                            <div><strong className="text-gray-400">Completeness:</strong> {f.completeness}</div>
                            <div><strong className="text-gray-400">Confidence Score:</strong> {f.confidenceScore}%</div>
                            {f.missingConcepts && f.missingConcepts.length > 0 && (
                              <div><strong className="text-gray-400">Missing Concepts:</strong> {f.missingConcepts.join(', ')}</div>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg p-2">
                            <strong className="text-gray-300 block mb-1">Suggested Answer:</strong>
                            {f.suggestedBetterAnswer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/resources" 
              className="island-button bg-white/5 border border-white/10 text-white w-full py-3 rounded-full text-center text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 mt-6"
            >
              <span className="material-symbols-outlined text-[13px]">school</span>
              Explore Learning Materials
            </Link>
          </div>

        </section>
      )}

    </div>
  )
}
