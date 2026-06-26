"""
Adzuna Jobs API Service
Fetches job market data, trends, and salary information
"""

import requests
from typing import Dict, List
from flask import current_app
from services.role_data import MARKET_DATABASE, SKILL_DATABASE


class AdzunaService:
    """Service for job market analysis using Adzuna API"""
    
    def __init__(self):
        """Initialize Adzuna API credentials"""
        self.api_id = current_app.config.get('ADZUNA_API_ID', '')
        self.api_key = current_app.config.get('ADZUNA_API_KEY', '')
        self.base_url = 'https://api.adzuna.com/v1'
    
    def get_job_market_data(self, job_title: str, location: str = 'US') -> Dict:
        """
        Get job market data for a specific role
        
        Args:
            job_title: Job title to search
            location: Location (country code)
            
        Returns:
            Dictionary with market data
        """
        try:
            if not self.api_id or not self.api_key:
                return self._get_fallback_market_data(job_title)
            
            # Adzuna API endpoint for job search
            endpoint = f'{self.base_url}/{location.lower()}/search/1'
            
            params = {
                'app_id': self.api_id,
                'app_key': self.api_key,
                'what': job_title,
                'results_per_page': 100,
                'sort_by': 'salary'
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return self._process_market_data(data, job_title)
            else:
                return self._get_fallback_market_data(job_title)
        
        except Exception as e:
            print(f'Error fetching Adzuna data: {str(e)}')
            return self._get_fallback_market_data(job_title)
    
    def _process_market_data(self, api_response: Dict, job_title: str) -> Dict:
        """Process Adzuna API response"""
        results = api_response.get('results', [])
        
        if not results:
            return self._get_fallback_market_data(job_title)
        
        # Extract salary information
        salaries = []
        for job in results:
            if job.get('salary_min') and job.get('salary_max'):
                salaries.append({
                    'min': job['salary_min'],
                    'max': job['salary_max']
                })
        
        # Calculate statistics
        if salaries:
            avg_min = sum(s['min'] for s in salaries) / len(salaries)
            avg_max = sum(s['max'] for s in salaries) / len(salaries)
        else:
            avg_min = avg_max = 0
        
        return {
            'job_title': job_title,
            'total_jobs': api_response.get('count', 0),
            'salary_data': {
                'average_min': round(avg_min, 2),
                'average_max': round(avg_max, 2),
                'average_salary': round((avg_min + avg_max) / 2, 2)
            },
            'job_trends': {
                'growth': 'High' if len(results) > 50 else 'Moderate' if len(results) > 20 else 'Low',
                'demand': len(results)
            }
        }
    
    def _get_fallback_market_data(self, job_title: str) -> Dict:
        """Return fallback market data from the shared MARKET_DATABASE (role_data.py)."""
        # Exact match first
        if job_title in MARKET_DATABASE:
            data = dict(MARKET_DATABASE[job_title])
            data['job_title'] = job_title
            return data

        # Partial / case-insensitive match
        jt_lower = job_title.lower()
        for key, data in MARKET_DATABASE.items():
            if key.lower() in jt_lower or jt_lower in key.lower():
                result = dict(data)
                result['job_title'] = job_title
                return result

        # Generic fallback
        return {
            'job_title': job_title,
            'total_jobs': 1000,
            'salary_data': {
                'average_min': 50000,
                'average_max': 100000,
                'average_salary': 75000
            },
            'job_trends': {
                'growth': 'Moderate',
                'demand': 1000,
                'growth_pct': 10,
            }
        }
    
    def get_required_skills(self, job_title: str) -> List[str]:
        """
        Get required skills for a job role.
        Pulls directly from SKILL_DATABASE in role_data.py (single source of truth).

        Args:
            job_title: Job title

        Returns:
            List of required skills
        """
        # Exact match
        if job_title in SKILL_DATABASE:
            return SKILL_DATABASE[job_title]['required']

        # Partial / case-insensitive match
        jt_lower = job_title.lower()
        for role, data in SKILL_DATABASE.items():
            if role.lower() in jt_lower or jt_lower in role.lower():
                return data['required']

        return ['Technical Skills', 'Problem Solving', 'Communication', 'Teamwork']
    
    def get_salary_range(self, job_title: str, experience_level: str = 'mid') -> Dict:
        """
        Get salary range for a job
        
        Args:
            job_title: Job title
            experience_level: 'junior', 'mid', 'senior'
            
        Returns:
            Dictionary with salary information
        """
        market_data = self.get_job_market_data(job_title)
        
        if 'salary_data' in market_data:
            avg_salary = market_data['salary_data']['average_salary']
            
            level_multipliers = {
                'junior': 0.7,
                'mid': 1.0,
                'senior': 1.4
            }
            
            multiplier = level_multipliers.get(experience_level, 1.0)
            
            return {
                'min': round(avg_salary * multiplier * 0.8, 2),
                'max': round(avg_salary * multiplier * 1.2, 2),
                'average': round(avg_salary * multiplier, 2),
                'experience_level': experience_level
            }
        
        return {}
    
    def get_job_trends_analysis(self, job_title: str) -> Dict:
        """
        Get job market trends
        
        Args:
            job_title: Job title
            
        Returns:
            Dictionary with trend analysis
        """
        market_data = self.get_job_market_data(job_title)
        
        total_jobs = market_data.get('total_jobs', 0)
        
        if total_jobs > 5000:
            growth = 'Explosive'
            trend_score = 10
        elif total_jobs > 2000:
            growth = 'Very High'
            trend_score = 9
        elif total_jobs > 1000:
            growth = 'High'
            trend_score = 7
        elif total_jobs > 500:
            growth = 'Moderate'
            trend_score = 5
        else:
            growth = 'Low'
            trend_score = 3
        
        return {
            'job_title': job_title,
            'total_open_positions': total_jobs,
            'growth_rate': growth,
            'market_demand_score': trend_score,
            'recommendation': f'This is a {"hot" if trend_score >= 7 else "growing" if trend_score >= 5 else "niche"} role in the market'
        }
