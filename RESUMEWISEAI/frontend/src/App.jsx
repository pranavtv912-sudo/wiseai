import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Route Security
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Core Pages
import Landing from './pages/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/index'
import CareerRoadmap from './pages/CareerRoadmap'
import LearningPlan from './pages/LearningPlan'

// Sub/Placeholder Pages
import UploadResume from './pages/UploadResume/index'
import ResumeAnalysis from './pages/ResumeAnalysis/index'
import SkillGap from './pages/SkillGap/index'
import Interview from './pages/Interview/index'
import Reports from './pages/Reports/index'
import History from './pages/History/index'
import Profile from './pages/Profile/index'
import Settings from './pages/Settings/index'
import JobDescriptionAnalyzer from './pages/JobDescriptionAnalyzer/index'
import ResumeBuilder from './pages/ResumeBuilder/index'
import DashboardAnalytics from './pages/DashboardAnalytics/index'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Shell Layout */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>

          {/* Main Dashboard Shell Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Landing />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/roadmap" element={<CareerRoadmap />} />
              <Route path="/resources" element={<LearningPlan />} />
              
              {/* Stubs / Placeholders */}
              <Route path="/upload" element={<UploadResume />} />
              <Route path="/analysis" element={<ResumeAnalysis />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/jd-match" element={<JobDescriptionAnalyzer />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/analytics" element={<DashboardAnalytics />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
