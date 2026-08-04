import React, { useEffect, useState } from 'react';
import { getDashboardOverview, getDashboardCharts } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import './DashboardAnalytics.css';

const COLORS = ['#6366F1', '#f59e0b', '#ef4444', '#3b82f6'];

const StatCard = ({ title, value, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="stat-card p-6 flex items-center justify-between"
  >
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#6366F1]">
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </div>
  </motion.div>
);

const ProgressBar = ({ label, value, color }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="font-bold text-gray-300">{label}</span>
      <span className="font-bold text-white">{value}%</span>
    </div>
    <div className="progress-bar-container">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="progress-bar-fill"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ovRes, chRes] = await Promise.all([
          getDashboardOverview(),
          getDashboardCharts()
        ]);
        setOverview(ovRes.data);
        setCharts(chRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="analytics-container p-8 pt-24 min-h-screen bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-28" />)}
          <div className="skeleton col-span-2 h-80" />
          <div className="skeleton col-span-2 h-80" />
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Completed', value: overview?.skills_completed || 0 },
    { name: 'Remaining', value: overview?.missing_skills || 0 }
  ];

  return (
    <div className="analytics-container min-h-screen bg-[#050505] pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Analytics Overview</h1>
            <p className="text-gray-400 text-sm">Welcome back, <span className="text-[#6366F1] font-bold">{user?.name}</span>. Here is your career progress.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Target Role</p>
            <p className="text-lg text-white font-bold">{user?.target_role || 'Not Specified'}</p>
          </div>
        </div>

        {/* Top Stats Grid (8 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Avg ATS Score" value={overview?.ats_score || 0} icon="speed" delay={0.1} />
          <StatCard title="Resume Match" value={`${overview?.resume_match || 0}%`} icon="join_inner" delay={0.2} />
          <StatCard title="Roadmap Progress" value={`${overview?.roadmap_progress || 0}%`} icon="map" delay={0.3} />
          <StatCard title="Interview Score" value={overview?.interview_score || 0} icon="record_voice_over" delay={0.4} />
          <StatCard title="Resumes Uploaded" value={overview?.resume_uploads || 0} icon="upload_file" delay={0.5} />
          <StatCard title="Total Analyses" value={overview?.analysis_count || 0} icon="analytics" delay={0.6} />
          <StatCard title="Skills Mastered" value={overview?.skills_completed || 0} icon="verified" delay={0.7} />
          <StatCard title="Missing Skills" value={overview?.missing_skills || 0} icon="error" delay={0.8} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="chart-card p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6366F1]">trending_up</span> ATS Score History
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.ats_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} dot={{r: 4, fill: '#6366F1', strokeWidth: 2}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="chart-card p-6 flex flex-col">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b]">pie_chart</span> Skills Progress
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#ccc'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="chart-card p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b82f6]">bar_chart</span> Resume Uploads by Day
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.resumeUploads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} allowDecimals={false} />
                  <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="chart-card p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ef4444]">mic</span> Interview Performance
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.interview}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="round" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                  <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Progress & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Bars */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }} className="chart-card p-6 col-span-1">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6366F1]">military_tech</span> Progress Tracker
            </h3>
            <ProgressBar label="Avg ATS Score" value={overview?.ats_score || 0} color="#6366F1" />
            <ProgressBar label="Roadmap Mastery" value={overview?.roadmap_progress || 0} color="#f59e0b" />
            <ProgressBar label="Interview Readiness" value={overview?.interview_score || 0} color="#ef4444" />
            <ProgressBar label="Resume Match (Avg)" value={overview?.resume_match || 0} color="#3b82f6" />
          </motion.div>

          {/* AI Insights & Recent Activity */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }} className="chart-card p-6 col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6366F1]">lightbulb</span> AI Insights
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="material-symbols-outlined text-[#6366F1] text-[20px] mt-0.5">check_circle</span>
                    <p className="text-sm text-gray-300">Your average ATS score is <strong className="text-white">{overview?.ats_score}%</strong>. Keep iterating your summary for better keyword matching.</p>
                  </li>
                  <li className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="material-symbols-outlined text-[#f59e0b] text-[20px] mt-0.5">warning</span>
                    <p className="text-sm text-gray-300">You have <strong className="text-white">{overview?.missing_skills} skills</strong> remaining in your learning roadmap.</p>
                  </li>
                  <li className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="material-symbols-outlined text-[#ef4444] text-[20px] mt-0.5">trending_up</span>
                    <p className="text-sm text-gray-300">Your mock interview scores are steadily improving. Great job!</p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">history</span> Recent Activity
                </h3>
                <div className="relative border-l border-white/10 ml-3 space-y-6">
                  {overview?.resume_uploads > 0 && (
                    <div className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-[#3b82f6] rounded-full -left-[6.5px] top-1"></div>
                      <p className="text-sm text-white font-bold">Resume Uploaded</p>
                      <p className="text-xs text-gray-500">Processed through ATS Parser</p>
                    </div>
                  )}
                  {overview?.analysis_count > 0 && (
                    <div className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-[#6366F1] rounded-full -left-[6.5px] top-1"></div>
                      <p className="text-sm text-white font-bold">ATS Analysis Completed</p>
                      <p className="text-xs text-gray-500">Detailed scorecard generated</p>
                    </div>
                  )}
                  <div className="pl-6 relative">
                    <div className="absolute w-3 h-3 bg-[#f59e0b] rounded-full -left-[6.5px] top-1"></div>
                    <p className="text-sm text-white font-bold">Roadmap Updated</p>
                    <p className="text-xs text-gray-500">{overview?.skills_completed} skills mastered</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

