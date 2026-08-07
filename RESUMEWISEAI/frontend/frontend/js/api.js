/**
 * ResumeWise AI - Frontend API Wrapper
 * Handles JWT authentication and communication with the Flask backend
 */

function getApiBaseUrl() {
    let envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
        ? import.meta.env.VITE_API_URL 
        : 'https://wiseai-production.up.railway.app/api';
    envUrl = envUrl.trim().replace(/\/+$/, '');
    if (!envUrl.endsWith('/api')) {
        envUrl += '/api';
    }
    return envUrl;
}

const API_BASE_URL = getApiBaseUrl();

class ResumeWiseAPI {
    static getHeaders(isMultipart = false) {
        const headers = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        
        const token = localStorage.getItem('rw_access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Merge headers
        const isMultipart = options.body instanceof FormData;
        options.headers = {
            ...this.getHeaders(isMultipart),
            ...options.headers
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                // If token expired, clear state
                if (response.status === 401 && localStorage.getItem('rw_access_token')) {
                    this.clearSession();
                    window.location.href = 'signin.html';
                }
                throw new Error(result.message || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // --- Authentication ---
    static async register(name, email, password) {
        const result = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        if (result.success && result.data.tokens) {
            this.setSession(result.data.tokens.access_token, result.data.user);
        }
        return result;
    }

    static async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (result.success && result.data.tokens) {
            this.setSession(result.data.tokens.access_token, result.data.user);
        }
        return result;
    }

    static async getProfile() {
        return this.request('/auth/profile', { method: 'GET' });
    }

    static async updateProfile(profileData) {
        const result = await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        if (result.success && result.data.user) {
            localStorage.setItem('rw_user', JSON.stringify(result.data.user));
        }
        return result;
    }

    static logout() {
        this.clearSession();
        window.location.href = 'index.html';
    }

    // Session Helpers
    static setSession(token, user) {
        localStorage.setItem('rw_access_token', token);
        localStorage.setItem('rw_user', JSON.stringify(user));
    }

    static clearSession() {
        localStorage.removeItem('rw_access_token');
        localStorage.removeItem('rw_user');
        localStorage.removeItem('rw_last_analyzed_id');
    }

    static isAuthenticated() {
        return !!localStorage.getItem('rw_access_token');
    }

    static getUser() {
        const user = localStorage.getItem('rw_user');
        return user ? JSON.parse(user) : null;
    }

    // --- Resume Management ---
    static async uploadResume(file, targetRole = '') {
        const formData = new FormData();
        formData.append('file', file);
        if (targetRole) {
            formData.append('target_role', targetRole);
        }

        return this.request('/resume/upload', {
            method: 'POST',
            body: formData
        });
    }

    static async parseResume(resumeId) {
        return this.request(`/resume/${resumeId}/parse`, {
            method: 'POST'
        });
    }

    static async listResumes(page = 1, perPage = 20) {
        return this.request(`/resume/list?page=${page}&per_page=${perPage}`, {
            method: 'GET'
        });
    }

    static async getResume(resumeId) {
        return this.request(`/resume/${resumeId}`, {
            method: 'GET'
        });
    }

    static async deleteResume(resumeId) {
        return this.request(`/resume/${resumeId}`, {
            method: 'DELETE'
        });
    }

    static getDownloadUrl(resumeId) {
        const token = localStorage.getItem('rw_access_token');
        return `${API_BASE_URL}/resume/${resumeId}/download?Authorization=Bearer ${token}`;
    }

    // --- Analysis ---
    static async analyzeResume(resumeId, targetRole) {
        return this.request('/analyze/', {
            method: 'POST',
            body: JSON.stringify({ resumeId, targetRole })
        });
    }

    static async getAnalysis(resumeId) {
        return this.request(`/analyze/${resumeId}`, {
            method: 'GET'
        });
    }

    static async getSkillGap(resumeId) {
        return this.request(`/analyze/${resumeId}/skill-gap`, {
            method: 'GET'
        });
    }

    // --- Career Roadmap ---
    static async generateRoadmap(currentSkills, goalRole, months = 12) {
        return this.request('/roadmap/generate', {
            method: 'POST',
            body: JSON.stringify({ currentSkills, goalRole, months })
        });
    }

    static async generateLearningPlan(skills, duration = 3) {
        return this.request('/roadmap/learning-plan', {
            method: 'POST',
            body: JSON.stringify({ skills, duration })
        });
    }

    // --- YouTube ---
    static async youtubeSearch(query, max = 9) {
        const q = encodeURIComponent(query);
        return this.request(`/roadmap/youtube-search?q=${q}&max=${max}`, { method: 'GET' });
    }
}

