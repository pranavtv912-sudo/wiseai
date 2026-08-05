"""
ATS Score Calculation Service
Calculates Applicant Tracking System scores based on resume analysis
"""

from typing import Dict, List, Tuple
from services.role_data import SKILL_DATABASE  # noqa: F401  — re-exported for legacy access


class ATSScoreCalculator:
    """Service for calculating ATS scores"""

    # SKILL_DATABASE is imported from services/role_data.py (single source of truth).
    # All 83+ roles with required & preferred skills live there.
    SKILL_DATABASE = SKILL_DATABASE
    
    def __init__(self):
        """Initialize ATS calculator"""
        self.weights = {
            'skills_match': 0.40,
            'projects': 0.20,
            'certifications': 0.15,
            'keywords': 0.15,
            'formatting': 0.10
        }
    
    def calculate_ats_score(self, resume_data: Dict, target_role: str = None, jd_skills: Dict = None) -> Dict:
        """
        Calculate comprehensive ATS score
        
        Args:
            resume_data: Extracted resume data
            target_role: Target job role for skill matching
            jd_skills: Optional custom required/preferred skills from job description
            
        Returns:
            Dictionary with ATS score and breakdown
        """
        scores = {}
        
        # Calculate individual component scores
        scores['skills_match'] = self._calculate_skills_match(
            resume_data.get('skills', []),
            target_role,
            jd_skills
        )
        scores['projects'] = self._calculate_projects_score(resume_data.get('projects', []))
        scores['certifications'] = self._calculate_certifications_score(
            resume_data.get('certifications', [])
        )
        scores['keywords'] = self._calculate_keywords_score(resume_data.get('keywords', []))
        scores['formatting'] = self._calculate_formatting_score(resume_data.get('raw_text', ''))
        
        # Calculate total ATS score
        total_score = sum(
            scores[component] * self.weights[component]
            for component in scores
        )
        
        return {
            'total_score': round(total_score, 2),
            'score_breakdown': {
                'skills_match': round(scores['skills_match'], 2),
                'projects': round(scores['projects'], 2),
                'certifications': round(scores['certifications'], 2),
                'keywords': round(scores['keywords'], 2),
                'formatting': round(scores['formatting'], 2),
            },
            'weighted_scores': {
                'skills_match': round(scores['skills_match'] * self.weights['skills_match'], 2),
                'projects': round(scores['projects'] * self.weights['projects'], 2),
                'certifications': round(scores['certifications'] * self.weights['certifications'], 2),
                'keywords': round(scores['keywords'] * self.weights['keywords'], 2),
                'formatting': round(scores['formatting'] * self.weights['formatting'], 2),
            }
        }
    
    def _calculate_skills_match(self, extracted_skills: List[str], target_role: str, jd_skills: Dict = None) -> float:
        """
        Calculate skills match score
        
        Scoring: 40% of total
        - Perfect match if all required skills present
        - Partial credit for preferred skills
        """
        if not extracted_skills:
            return 0.0
        
        required_skills = []
        preferred_skills = []
        
        if jd_skills and ('required' in jd_skills or 'preferred' in jd_skills):
            required_skills = jd_skills.get('required', [])
            preferred_skills = jd_skills.get('preferred', [])
        elif target_role and target_role in self.SKILL_DATABASE:
            role_skills = self.SKILL_DATABASE[target_role]
            required_skills = role_skills['required']
            preferred_skills = role_skills['preferred']
        else:
            # Generic scoring if no target role
            return min(len(extracted_skills) / 10 * 100, 100)
        
        matched_required = sum(
            1 for skill in extracted_skills
            if any(req.lower() in skill.lower() or skill.lower() in req.lower()
                   for req in required_skills)
        )
        
        matched_preferred = sum(
            1 for skill in extracted_skills
            if any(pref.lower() in skill.lower() or skill.lower() in pref.lower()
                   for pref in preferred_skills)
        )
        
        # Score calculation
        required_coverage = (matched_required / len(required_skills)) * 70 if required_skills else 0
        preferred_coverage = (matched_preferred / len(preferred_skills)) * 30 if preferred_skills else 0
        
        return min(required_coverage + preferred_coverage, 100)
    
    def _calculate_projects_score(self, projects: List[Dict]) -> float:
        """
        Calculate projects score
        
        Scoring: 20% of total
        - 0 projects: 0 points
        - 1-2 projects: 30 points
        - 3-4 projects: 60 points
        - 5+ projects: 100 points
        """
        project_count = len(projects)
        
        if project_count == 0:
            return 0.0
        elif project_count <= 2:
            return min(30.0, 15 * project_count)
        elif project_count <= 4:
            return min(60.0, 20 * project_count)
        else:
            return 100.0
    
    def _calculate_certifications_score(self, certifications: List[str]) -> float:
        """
        Calculate certifications score
        
        Scoring: 15% of total
        - Premium certifications (AWS, Azure, GCP, CISSP): 25 points each
        - Standard certifications (others): 10 points each
        """
        if not certifications:
            return 0.0
        
        premium_certs = {
            'AWS', 'Azure', 'GCP', 'CISSP', 'CCNA', 'Kubernetes',
            'Google Cloud', 'SAP', 'Oracle', 'Salesforce', 'PMP', 'CSM'
        }
        
        score = 0.0
        
        for cert in certifications:
            if any(pc.lower() in cert.lower() for pc in premium_certs):
                score += 25
            else:
                score += 10
        
        return min(score, 100)
    
    def _calculate_keywords_score(self, keywords: List[str]) -> float:
        """
        Calculate keywords diversity score
        
        Scoring: 15% of total
        - Based on number and diversity of keywords
        """
        if not keywords:
            return 0.0
        
        # Bonus for keyword diversity
        unique_keywords = len(set(keywords))
        
        if unique_keywords < 5:
            return 20.0
        elif unique_keywords < 10:
            return 50.0
        elif unique_keywords < 20:
            return 80.0
        else:
            return 100.0
    
    def _calculate_formatting_score(self, resume_text: str) -> float:
        """
        Calculate formatting score
        
        Scoring: 10% of total
        - Word count: 300-1000 words optimal
        - Proper sections present
        """
        if not resume_text:
            return 0.0
        
        word_count = len(resume_text.split())
        formatting_score = 100.0
        
        # Penalty for too short resume
        if word_count < 300:
            formatting_score -= 30
        elif word_count > 1000:
            formatting_score -= 10
        
        # Check for key sections
        required_sections = ['experience', 'education', 'skills']
        text_lower = resume_text.lower()
        
        found_sections = sum(
            1 for section in required_sections
            if section in text_lower
        )
        
        if found_sections < 2:
            formatting_score -= 20
        
        return max(formatting_score, 0)
    
    def get_skill_gap_analysis(self, extracted_skills: List[str], target_role: str, jd_skills: Dict = None) -> Dict:
        """
        Analyze skill gaps for target role or custom job description skills
        
        Args:
            extracted_skills: Skills extracted from resume
            target_role: Target job role
            jd_skills: Optional custom required/preferred skills from job description
            
        Returns:
            Dictionary with skill gap analysis
        """
        required_skills = set()
        preferred_skills = set()
        
        if jd_skills and ('required' in jd_skills or 'preferred' in jd_skills):
            required_skills = set(jd_skills.get('required', []))
            preferred_skills = set(jd_skills.get('preferred', []))
        elif target_role in self.SKILL_DATABASE:
            role_skills = self.SKILL_DATABASE[target_role]
            required_skills = set(role_skills['required'])
            preferred_skills = set(role_skills['preferred'])
        else:
            return {
                'error': f'Target role "{target_role}" not found in database',
                'available_roles': list(self.SKILL_DATABASE.keys())
            }
        
        extracted_set = set(s.lower() for s in extracted_skills)
        
        # Find matching and missing skills
        matching_skills = []
        missing_required = []
        missing_preferred = []
        
        for req_skill in required_skills:
            if any(req_skill.lower() in skill or skill in req_skill.lower()
                   for skill in extracted_set):
                matching_skills.append(req_skill)
            else:
                missing_required.append(req_skill)
        
        for pref_skill in preferred_skills:
            if not any(pref_skill.lower() in skill or skill in pref_skill.lower()
                      for skill in extracted_set):
                missing_preferred.append(pref_skill)
        
        return {
            'target_role': target_role,
            'matching_skills': matching_skills,
            'missing_required_skills': missing_required,
            'missing_preferred_skills': missing_preferred,
            'total_required_skills': len(required_skills),
            'total_preferred_skills': len(preferred_skills),
            'coverage_percentage': round((len(matching_skills) / len(required_skills)) * 100, 2) if required_skills else 100.0
        }
