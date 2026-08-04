import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithAssistant } from '../services/api';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('resumeWise_chat_history');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    } else {
      // Initial greeting
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hello! I am your AI Career Assistant. How can I help you with your resume, interviews, or career today?' 
        }
      ]);
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('resumeWise_chat_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (msg = input) => {
    if (!msg.trim() || isLoading) return;

    const userMessage = { role: 'user', content: msg.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatWithAssistant(userMessage.content);
      if (res.success && res.data?.response) {
        setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered a network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem('resumeWise_chat_history');
    setMessages([
      { 
        role: 'assistant', 
        content: 'Chat history cleared. How can I help you?' 
      }
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const quickQuestions = [
    "How can I improve my ATS score?",
    "Generate a resume summary.",
    "Give me some interview questions."
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90' 
              : 'bg-gradient-to-tr from-[#6366F1] to-[#3baf81] hover:shadow-[0_0_20px_rgba(99, 102, 241,0.5)] hover:-translate-y-1'
          }`}
        >
          <span className="material-symbols-outlined text-white text-[28px]">
            {isOpen ? 'close' : 'chat'}
          </span>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] sm:w-[450px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-[#111] p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center border border-[#6366F1]/30">
                <span className="material-symbols-outlined text-[#6366F1] text-[18px]">psychology</span>
              </div>
              <div>
                <h3 className="text-white text-sm font-bold tracking-widest uppercase">ResumeWise AI</h3>
                <p className="text-[#6366F1] text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={handleClearChat}
              title="Clear Chat"
              className="text-gray-500 hover:text-red-400 transition-colors p-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 relative group ${
                    msg.role === 'user' 
                      ? 'bg-[#6366F1] text-[#00173b] rounded-tr-sm' 
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => copyToClipboard(msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                      title="Copy response"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    </button>
                  )}
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-p:text-[#00173b] prose-strong:text-[#00173b]' : 'prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#6366F1] prose-strong:text-white prose-code:text-[#6366F1] prose-pre:bg-[#000]'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (only show if no recent messages to save space, or always show below) */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-medium hover:bg-[#6366F1]/10 hover:text-[#6366F1] hover:border-[#6366F1]/30 transition-all flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-[#111] border-t border-white/5">
            <div className="relative flex items-end gap-2 bg-[#050505] border border-white/10 rounded-xl focus-within:border-[#6366F1]/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your career..."
                className="w-full bg-transparent text-white text-sm p-3 max-h-32 min-h-[44px] resize-none focus:outline-none custom-scrollbar"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 text-[#6366F1] hover:text-white disabled:opacity-50 disabled:hover:text-[#6366F1] transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Shift + Enter for newline</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

