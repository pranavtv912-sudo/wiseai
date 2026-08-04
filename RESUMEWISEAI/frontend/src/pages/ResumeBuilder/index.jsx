import React, { useState, useEffect, useCallback } from 'react';
import { generateOrPrefillResume, downloadBuiltResume } from '../../services/api';
import { ResumePreview } from './templates';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function ResumeBuilder() {
  const { user } = useAuth();
  
  const initialData = {
    name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '',
    summary: '', skills: [], education: [], experience: [], projects: [], certifications: []
  };

  const [resumeData, setResumeData] = useState(initialData);
  const [template, setTemplate] = useState('Modern');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [score, setScore] = useState(0);

  // Load from local storage or prefill on mount
  useEffect(() => {
    const saved = localStorage.getItem('resumeWise_builder_data');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      handlePrefill();
    }
  }, []);

  // Auto-save and calculate score
  useEffect(() => {
    localStorage.setItem('resumeWise_builder_data', JSON.stringify(resumeData));
    calculateScore();
  }, [resumeData]);

  const calculateScore = useCallback(() => {
    let s = 0;
    if (resumeData.name) s += 10;
    if (resumeData.email) s += 10;
    if (resumeData.summary) s += 20;
    if (resumeData.skills?.length > 0) s += 20;
    if (resumeData.experience?.length > 0) s += 20;
    if (resumeData.education?.length > 0) s += 10;
    if (resumeData.projects?.length > 0) s += 10;
    setScore(s);
  }, [resumeData]);

  const handlePrefill = async () => {
    setIsLoading(true);
    try {
      const res = await generateOrPrefillResume({ action: 'prefill' });
      if (res.success && res.data) {
        setResumeData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiImprove = async (action, textData, fieldPath) => {
    if (!textData) return;
    setIsAiLoading(true);
    try {
      const res = await generateOrPrefillResume({
        action,
        data: textData,
        role: resumeData.experience?.[0]?.role || 'Professional'
      });
      
      if (res.success && res.data) {
        if (fieldPath === 'summary') {
          handleChange('summary', res.data);
        } else if (typeof fieldPath === 'function') {
          fieldPath(res.data); // Custom updater
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to improve text via AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await downloadBuiltResume(resumeData, template);
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resumeData.name || 'Resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear your resume draft?")) {
      setResumeData(initialData);
      localStorage.removeItem('resumeWise_builder_data');
    }
  };

  const handleChange = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (arrayName, index, field, value) => {
    const newArray = [...resumeData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    handleChange(arrayName, newArray);
  };

  const addArrayItem = (arrayName, emptyObj) => {
    handleChange(arrayName, [...resumeData[arrayName], emptyObj]);
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...resumeData[arrayName]];
    newArray.splice(index, 1);
    handleChange(arrayName, newArray);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pt-20">
      
      {/* Top Toolbar */}
      <div className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Resume Builder</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Template:</span>
            <select 
              value={template} 
              onChange={e => setTemplate(e.target.value)}
              className="bg-[#222] border border-white/20 text-white rounded px-3 py-1 text-sm outline-none focus:border-[#6366F1]"
            >
              <option value="Modern">Modern</option>
              <option value="Professional">Professional</option>
              <option value="Minimal">Minimal</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-400">Completeness:</span>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${score}%`,
                  backgroundColor: score > 80 ? '#6366F1' : score > 50 ? '#f59e0b' : '#ef4444'
                }}
              ></div>
            </div>
            <span className="text-xs font-bold" style={{ color: score > 80 ? '#6366F1' : score > 50 ? '#f59e0b' : '#ef4444' }}>
              {score}%
            </span>
          </div>
          
          <button onClick={handleReset} className="text-gray-400 hover:text-red-400 text-sm font-medium transition">
            Reset
          </button>
          <button onClick={handlePrefill} disabled={isLoading} className="text-white hover:text-[#6366F1] text-sm font-medium transition flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">sync</span> Prefill
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isLoading}
            className="bg-[#6366F1] text-[#00173b] px-4 py-2 rounded font-bold text-sm hover:bg-[#3baf81] transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : <span className="material-symbols-outlined text-[16px]">download</span>}
            Download PDF
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE: Editor */}
        <div className="w-1/2 h-full overflow-y-auto p-6 bg-[#050505] custom-scrollbar border-r border-white/10 space-y-8">
          
          {/* Personal Info */}
          <section>
            <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" value={resumeData.name} onChange={e => handleChange('name', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
              <input type="email" placeholder="Email" value={resumeData.email} onChange={e => handleChange('email', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
              <input type="tel" placeholder="Phone" value={resumeData.phone} onChange={e => handleChange('phone', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
              <input type="text" placeholder="LinkedIn URL" value={resumeData.linkedin} onChange={e => handleChange('linkedin', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
              <input type="text" placeholder="GitHub URL" value={resumeData.github} onChange={e => handleChange('github', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
              <input type="text" placeholder="Portfolio URL" value={resumeData.portfolio} onChange={e => handleChange('portfolio', e.target.value)} className="bg-[#111] border border-white/10 text-white p-2 rounded focus:border-[#6366F1] outline-none" />
            </div>
          </section>

          {/* Professional Summary */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm">Professional Summary</h2>
              <button 
                onClick={() => handleAiImprove('improve_summary', resumeData.summary, 'summary')}
                disabled={isAiLoading || !resumeData.summary}
                className="flex items-center gap-1 text-[11px] font-bold bg-white/5 hover:bg-white/10 text-[#6366F1] px-2 py-1 rounded disabled:opacity-50 transition"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Improve
              </button>
            </div>
            <textarea 
              rows={4}
              placeholder="Write a compelling professional summary..." 
              value={resumeData.summary} 
              onChange={e => handleChange('summary', e.target.value)} 
              className="w-full bg-[#111] border border-white/10 text-white p-3 rounded focus:border-[#6366F1] outline-none custom-scrollbar resize-none" 
            />
          </section>

          {/* Experience */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm">Experience</h2>
              <button onClick={() => addArrayItem('experience', {company: '', role: '', duration: '', description: ''})} className="text-[#6366F1] hover:text-white transition">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="bg-[#111] border border-white/5 p-4 rounded relative group">
                  <button onClick={() => removeArrayItem('experience', idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Company" value={exp.company} onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm" />
                    <input type="text" placeholder="Role" value={exp.role} onChange={e => updateArrayItem('experience', idx, 'role', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm" />
                    <input type="text" placeholder="Duration (e.g. Jan 2020 - Present)" value={exp.duration} onChange={e => updateArrayItem('experience', idx, 'duration', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm col-span-2" />
                  </div>
                  <div className="relative">
                    <textarea 
                      rows={3} 
                      placeholder="Bullet points of achievements..." 
                      value={exp.description} 
                      onChange={e => updateArrayItem('experience', idx, 'description', e.target.value)} 
                      className="w-full bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm custom-scrollbar" 
                    />
                    <button 
                      onClick={() => handleAiImprove('improve_bullets', exp.description, (newVal) => updateArrayItem('experience', idx, 'description', newVal))}
                      disabled={isAiLoading || !exp.description}
                      className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-bold bg-white/10 hover:bg-[#6366F1]/20 text-[#6366F1] px-2 py-1 rounded disabled:opacity-50 transition"
                    >
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span> Improve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm">Education</h2>
              <button onClick={() => addArrayItem('education', {institution: '', degree: '', year: ''})} className="text-[#6366F1] hover:text-white transition">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="bg-[#111] border border-white/5 p-4 rounded relative group">
                  <button onClick={() => removeArrayItem('education', idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <input type="text" placeholder="Institution" value={edu.institution} onChange={e => updateArrayItem('education', idx, 'institution', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm col-span-2" />
                    <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateArrayItem('education', idx, 'degree', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm" />
                    <input type="text" placeholder="Year" value={edu.year} onChange={e => updateArrayItem('education', idx, 'year', e.target.value)} className="bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm">Projects</h2>
              <button onClick={() => addArrayItem('projects', {name: '', description: ''})} className="text-[#6366F1] hover:text-white transition">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="bg-[#111] border border-white/5 p-4 rounded relative group">
                  <button onClick={() => removeArrayItem('projects', idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <div className="mb-3 pr-6">
                    <input type="text" placeholder="Project Name" value={proj.name} onChange={e => updateArrayItem('projects', idx, 'name', e.target.value)} className="w-full bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm" />
                  </div>
                  <div className="relative">
                    <textarea 
                      rows={2} 
                      placeholder="Project description..." 
                      value={proj.description} 
                      onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} 
                      className="w-full bg-[#1a1a1a] border border-transparent text-white p-2 rounded focus:border-[#6366F1] outline-none text-sm custom-scrollbar" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills & Certifications */}
          <section className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Skills</h2>
              <textarea 
                rows={4}
                placeholder="Comma separated skills..." 
                value={resumeData.skills.join(', ')} 
                onChange={e => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                className="w-full bg-[#111] border border-white/10 text-white p-3 rounded focus:border-[#6366F1] outline-none custom-scrollbar resize-none text-sm" 
              />
            </div>
            <div>
              <h2 className="text-[#6366F1] font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Certifications</h2>
              <textarea 
                rows={4}
                placeholder="Comma separated certifications..." 
                value={resumeData.certifications.join(', ')} 
                onChange={e => handleChange('certifications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                className="w-full bg-[#111] border border-white/10 text-white p-3 rounded focus:border-[#6366F1] outline-none custom-scrollbar resize-none text-sm" 
              />
            </div>
          </section>

        </div>

        {/* RIGHT PANE: Live Preview */}
        <div className="w-1/2 h-full bg-[#1a1a1a] overflow-y-auto p-8 custom-scrollbar flex justify-center">
          <div className="w-[800px] h-fit bg-white shadow-2xl scale-[0.8] origin-top transition-all" style={{ transformOrigin: 'top center' }}>
            <ResumePreview data={resumeData} template={template} />
          </div>
        </div>

      </div>
    </div>
  );
}

