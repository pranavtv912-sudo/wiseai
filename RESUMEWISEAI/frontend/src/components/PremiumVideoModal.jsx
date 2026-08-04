import React, { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract an 11-character YouTube video ID from any known URL format,
 * a raw video ID string, or a video object.
 */
const extractVideoId = (input) => {
  if (!input) return '';

  // If it's an object, check the common key names first
  if (typeof input === 'object') {
    const directId = input.video_id || input.videoId;
    if (directId && directId.length === 11) return directId;

    // Fall through using the URL or link fields
    const urlStr = input.url || input.link || input.youtube_url || '';
    return extractVideoId(urlStr);
  }

  const str = String(input).trim();

  // Already an 11-char ID with no URL characters
  if (str.length === 11 && !/[/?&=]/.test(str)) return str;

  // Standard YouTube URL patterns
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,      // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/,  // youtu.be/ID
    /\/embed\/([A-Za-z0-9_-]{11})/,    // /embed/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/,   // /shorts/ID
    /\/v\/([A-Za-z0-9_-]{11})/,        // /v/ID
  ];

  for (const re of patterns) {
    const m = str.match(re);
    if (m && m[1]) return m[1];
  }

  return '';
};

/**
 * Build a clean embed URL from a video ID.
 */
const buildEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PremiumVideoModal({ activeVideo, setActiveVideo, videosList = [] }) {
  const [currentVideo, setCurrentVideo] = useState(activeVideo);
  const [iframeKey, setIframeKey] = useState(0);          // force re-mount on video change
  const [iframeLoaded, setIframeLoaded] = useState(false); // hide skeleton once loaded
  const [allFailed, setAllFailed] = useState(false);

  // Sync when parent changes the active video
  useEffect(() => {
    setCurrentVideo(activeVideo);
    setIframeLoaded(false);
    setAllFailed(false);
    setIframeKey(k => k + 1);
  }, [activeVideo]);

  const handleClose = useCallback(() => setActiveVideo(null), [setActiveVideo]);

  // -------------------------------------------------------------------------
  // Auto-fallback: try next video in the list when the iframe errors
  // -------------------------------------------------------------------------
  const handleIframeError = useCallback(() => {
    const list = Array.isArray(videosList) ? videosList : [];
    const currentId = extractVideoId(currentVideo);
    const currentIndex = list.findIndex(v => extractVideoId(v) === currentId);

    if (currentIndex !== -1 && currentIndex + 1 < list.length) {
      const next = list[currentIndex + 1];
      console.warn(`Video ${currentId} failed. Trying next: ${extractVideoId(next)}`);
      setCurrentVideo(next);
      setIframeLoaded(false);
      setIframeKey(k => k + 1);
    } else {
      setAllFailed(true);
    }
  }, [currentVideo, videosList]);

  if (!currentVideo) return null;

  const videoId = extractVideoId(currentVideo);

  // A video is embeddable only when we have a real 11-char ID and the
  // URL doesn't point to a YouTube search-results page.
  const sourceUrl = (typeof currentVideo === 'object' ? currentVideo.url : '') || '';
  const isSearchResults = sourceUrl.includes('results?');
  const isEmbeddable = videoId.length === 11 && !isSearchResults && !currentVideo.forceFallback;

  const embedUrl = isEmbeddable ? buildEmbedUrl(videoId) : '';
  const watchUrl = isEmbeddable
    ? `https://www.youtube.com/watch?v=${videoId}`
    : sourceUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(currentVideo.title || '')}`;

  const title = (typeof currentVideo === 'object' ? currentVideo.title : '') || 'Loading…';
  const channel = (typeof currentVideo === 'object' ? currentVideo.channel : '') || 'YouTube';
  const description =
    (typeof currentVideo === 'object' ? currentVideo.description : '') ||
    'Master the core fundamentals and advanced concepts in this comprehensive module.';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[1400px] h-full md:max-h-[90vh] bg-[#0A0A0A] md:rounded-[24px] border border-white/10 shadow-2xl relative flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center transition-all z-[60]"
        >
          <span className="material-symbols-outlined text-white text-sm">close</span>
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Left column (70%)                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-full lg:w-[70%] p-6 lg:p-8 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl text-white font-bold leading-tight mb-2 pr-12">
              {title}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[#6366F1] text-sm font-bold uppercase tracking-widest">
                {channel}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Premium
              </span>
            </div>
          </div>

          {/* ---- Video Player ---- */}
          <div
            className="w-full rounded-[16px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 bg-black relative flex-shrink-0"
            style={{ aspectRatio: '16/9' }}
          >
            {allFailed ? (
              /* All videos in the list have been tried and failed */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-950 via-black to-zinc-950">
                <span className="material-symbols-outlined text-red-400 text-5xl mb-4">
                  error_outline
                </span>
                <h4 className="text-white font-bold text-lg mb-2">
                  No embeddable learning video is available.
                </h4>
                <p className="text-gray-400 text-xs max-w-md leading-relaxed">
                  All available resources for this topic have embedding restrictions or failed to load.
                </p>
              </div>
            ) : isEmbeddable ? (
              <>
                {/* Loading skeleton — hidden as soon as iframe fires onLoad */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20 pointer-events-none">
                    <span className="material-symbols-outlined text-white/20 text-5xl animate-spin">
                      sync
                    </span>
                  </div>
                )}

                {/* The actual iframe */}
                <iframe
                  key={iframeKey}
                  title={title}
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  style={{ zIndex: 10 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={() => {
                    console.log('iframe loaded:', embedUrl);
                    setIframeLoaded(true);
                  }}
                  onError={() => {
                    console.warn('iframe error:', embedUrl);
                    handleIframeError();
                  }}
                />
              </>
            ) : (
              /* Video ID missing or is a search-results page */
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-[#3B82F6] text-5xl mb-4 animate-pulse">
                  warning
                </span>
                <h4 className="text-white font-bold text-lg mb-2">
                  Video Embedding Restricted
                </h4>
                <p className="text-gray-400 text-xs max-w-md mb-6 leading-relaxed">
                  Due to YouTube restrictions, this tutorial cannot be played inside the app.
                </p>
              </div>
            )}
          </div>

          {/* Course Details Bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-6 border-y border-white/10 flex-shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Instructor</p>
              <p className="text-xs font-semibold text-white">{channel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Duration</p>
              <p className="text-xs font-semibold text-white">
                {(typeof currentVideo === 'object' && currentVideo.duration) || '45 Mins'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Difficulty</p>
              <p className="text-xs font-semibold text-[#6366F1]">Intermediate</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Rating</p>
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                4.9 <span className="material-symbols-outlined text-[12px]">star</span>
              </p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Certificate</p>
              <p className="text-xs font-semibold text-white">Included</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 flex-shrink-0">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6366F1]">description</span> Course Description
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">{description}</p>
          </div>

          {/* Prev / Next lesson controls */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5 flex-shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-x-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Prev Lesson
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-1">
              Next Lesson <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right column (30%)                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-full lg:w-[30%] bg-[#111] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 lg:p-8 space-y-8 flex-1">

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-[1.2rem] p-5 border border-white/10 shadow-lg hover:border-[#6366F1]/30 transition-colors group">
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#6366F1]">donut_large</span> Progress
                </h4>
                <span className="text-[#6366F1] font-bold text-xl leading-none">42%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2.5 mb-4 border border-white/5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#6366F1] to-[#a78bfa] h-full rounded-full w-[42%] group-hover:w-[45%] transition-all duration-1000" />
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

            {/* AI Copilot Notes */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bfa]">psychology</span> AI Copilot
              </h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span> Course Overview
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    A comprehensive deep dive into {title}. You will learn industry-standard practices and real-world applications.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span> Key Concepts
                  </h4>
                  <ul className="text-gray-400 text-xs space-y-2">
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Architecture Fundamentals</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Best Practices &amp; Optimization</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Common Interview Pitfalls</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="text-[#6366F1] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">forum</span> Interview Prep
                  </h4>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-400 mb-1 italic">"How does this concept scale in production?"</p>
                    <p className="text-[10px] text-[#6366F1]">Tip: Mention caching and load balancing.</p>
                  </div>
                </div>

                <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 hover:border-blue-500/20 transition-colors">
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
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Resources &amp; Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'sync', label: 'Regenerate' },
                  { icon: 'download', label: 'Download PDF' },
                  { icon: 'content_copy', label: 'Copy Notes' },
                  { icon: 'style', label: 'Flashcards' },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
                  </button>
                ))}
              </div>
              <button className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#3baf81] text-[#00173b] hover:shadow-[0_0_20px_rgba(99, 102, 241,0.3)] text-[10px] font-bold uppercase tracking-widest transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">record_voice_over</span>
                Practice Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}

