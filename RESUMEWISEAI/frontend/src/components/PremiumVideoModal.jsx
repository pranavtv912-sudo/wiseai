import React from 'react';

const getEmbedUrl = (video) => {
  if (!video) return '';
  let urlStr = '';
  if (typeof video === 'string') {
    urlStr = video;
  } else {
    urlStr = video.url || video.video_id || '';
  }

  if (!urlStr) return '';

  if (urlStr.length === 11 && !urlStr.includes('/') && !urlStr.includes('?')) {
    return `https://www.youtube.com/embed/${urlStr}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
  }

  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = urlStr.match(regExp);
  let id = '';
  if (match && match[1] && match[1].length === 11) {
    id = match[1];
  } else {
    const parts = urlStr.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length === 11) {
      id = lastPart;
    } else {
      try {
        const urlObj = new URL(urlStr);
        if (urlObj.searchParams.has('v')) {
          id = urlObj.searchParams.get('v');
        }
      } catch (e) {
        // Ignored
      }
    }
  }

  if (id && id.length === 11) {
    return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
  }
  return `${urlStr}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
};

export default function PremiumVideoModal({ activeVideo, setActiveVideo }) {
  if (!activeVideo) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300"
      onClick={() => setActiveVideo(null)}
    >
      <div 
        className="w-full max-w-[1400px] h-full md:max-h-[90vh] bg-[#0A0A0A] md:rounded-[24px] border border-white/10 shadow-2xl relative flex flex-col lg:flex-row overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button inside top-right corner */}
        <button 
          onClick={() => setActiveVideo(null)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center transition-all z-[60]"
        >
          <span className="material-symbols-outlined text-white text-sm">close</span>
        </button>

        {/* Left Column (70%) */}
        <div className="w-full lg:w-[70%] p-6 lg:p-8 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl text-white font-bold leading-tight mb-2 pr-12 group">
              {activeVideo.title}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[#4edea3] text-sm font-bold uppercase tracking-widest">
                {activeVideo.channel || 'ResumeWise Instructor'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Premium
              </span>
            </div>
          </div>

          {/* YouTube player inside a card */}
          <div className="w-full rounded-[16px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 bg-black relative group flex-shrink-0" style={{ aspectRatio: '16/9' }}>
            {/* Loading placeholder skeleton that shows while iframe loads */}
            <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center z-0">
              <span className="material-symbols-outlined text-white/20 text-5xl animate-spin">sync</span>
            </div>
            <iframe 
              title="Player"
              className="w-full h-full border-0 relative z-10" 
              src={getEmbedUrl(activeVideo)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          </div>

          {/* Course Details Bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-6 border-y border-white/10 flex-shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Instructor</p>
              <p className="text-xs font-semibold text-white">{activeVideo.channel || 'Pro Developer'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Duration</p>
              <p className="text-xs font-semibold text-white">45 Mins</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Difficulty</p>
              <p className="text-xs font-semibold text-[#4edea3]">Intermediate</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Rating</p>
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                4.9 <span className="material-symbols-outlined text-[12px] fill-current">star</span>
              </p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Certificate</p>
              <p className="text-xs font-semibold text-white">Included</p>
            </div>
          </div>

          <div className="mt-8 flex-shrink-0">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">description</span> Course Description
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
              {activeVideo.description || "Master the core fundamentals and advanced concepts in this comprehensive module. Designed specifically to target your skill gaps and accelerate your career trajectory."}
            </p>
          </div>

          {/* Previous / Next Lesson controls (Visual Only as per requirements) */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5 flex-shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-x-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Prev Lesson
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4edea3]/10 hover:bg-[#4edea3]/20 text-[#4edea3] text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-1">
              Next Lesson <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

        </div>

        {/* Right Column (30%) */}
        <div className="w-full lg:w-[30%] bg-[#111] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
          
          <div className="p-6 lg:p-8 space-y-8 flex-1">
            
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-[1.2rem] p-5 border border-white/10 shadow-lg hover:border-[#4edea3]/30 transition-colors group">
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#4edea3]">donut_large</span> Progress
                </h4>
                <span className="text-[#4edea3] font-bold text-xl leading-none">42%</span>
              </div>
              
              {/* Custom Progress Bar */}
              <div className="w-full bg-black rounded-full h-2.5 mb-4 border border-white/5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#4edea3] to-[#a78bfa] h-full rounded-full w-[42%] relative overflow-hidden group-hover:w-[45%] transition-all duration-1000">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Completed</p>
                  <p className="text-xs text-white font-semibold">6 / 14 Lessons</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Estimated</p>
                  <p className="text-xs text-white font-semibold">2 Hours Left</p>
                </div>
              </div>
            </div>

            {/* AI Notes */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bfa]">psychology</span> AI Copilot
              </h3>
              
              <div className="space-y-4">
                {/* Overview */}
                <div className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span> Course Overview
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    A comprehensive deep dive into {activeVideo.title}. You will learn industry-standard practices and real-world applications.
                  </p>
                </div>

                {/* Key Concepts */}
                <div className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span> Key Concepts
                  </h4>
                  <ul className="text-gray-400 text-xs space-y-2">
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Architecture Fundamentals</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Best Practices & Optimization</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Common Interview Pitfalls</li>
                  </ul>
                </div>

                {/* Interview Questions */}
                <div className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-[#4edea3] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">forum</span> Interview Prep
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-400 mb-1 italic">"How does this concept scale in production?"</p>
                      <p className="text-[10px] text-[#4edea3]">Tip: Mention caching and load balancing.</p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="group bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 hover:border-blue-500/20 transition-colors">
                  <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Pro Tips
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Always write clean, modular code. Interviewers look for maintainability over raw speed in initial rounds.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 pb-6">
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Resources & Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Regenerate</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Download PDF</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Copy Notes</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="material-symbols-outlined text-[20px]">style</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Flashcards</span>
                </button>
              </div>
              <button className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#3baf81] text-[#003824] hover:shadow-[0_0_20px_rgba(78,222,163,0.3)] text-[10px] font-bold uppercase tracking-widest transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">record_voice_over</span> Practice Interview
              </button>
            </div>

          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
          0% { transform: translateX(-100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
