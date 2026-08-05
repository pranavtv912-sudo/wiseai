"""
Career Roadmap and Learning Routes
Generates career development roadmaps and learning recommendations
"""

from flask import Blueprint, request
from models import User
from utils import token_required, success_response, error_response
from services import GeminiAIService, YouTubeService
from typing import List

roadmap_routes = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')


@roadmap_routes.route('/generate', methods=['POST'])
@token_required
def generate_roadmap(user, payload):
    """
    Generate career roadmap
    
    Expected JSON:
    {
        "currentSkills": ["Python", "SQL"],
        "goalRole": "AI Engineer",
        "months": 12
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        current_skills = data.get('currentSkills', [])
        goal_role = data.get('goalRole', 'Software Developer')
        months = data.get('months', 12)
        
        if not current_skills:
            return error_response('currentSkills is required', status_code=400)
        
        if months < 1 or months > 36:
            return error_response('months must be between 1 and 36', status_code=422)
        
        # Generate roadmap using AI
        gemini = GeminiAIService()
        roadmap = gemini.generate_career_roadmap(current_skills, goal_role, months)
        if not isinstance(roadmap, dict):
            roadmap = {}
        
        # Get learning resources for each skill
        youtube = YouTubeService()
        learning_resources = {}
        
        for month_key, month_data in list(roadmap.items())[:6]:  # Get resources for first 6 months
            if isinstance(month_data, dict):
                focus_skill = month_data.get('focus', '')
                if focus_skill:
                    learning_resources[month_key] = youtube.search_skill_tutorials(focus_skill, max_results=3)
        
        return success_response('Career roadmap generated successfully', {
            'roadmap': roadmap,
            'learningResources': learning_resources,
            'goalRole': goal_role,
            'months': months,
            'currentSkills': current_skills
        })
    
    except Exception as e:
        return error_response(f'Error generating roadmap: {str(e)}', status_code=500)


@roadmap_routes.route('/generate-notes', methods=['POST'])
@token_required
def generate_notes(user, payload):
    """
    Generate AI notes for a given skill.
    Expected JSON:
    {
        "skill": "Flask"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)

        skill = data.get('skill', '').strip()
        if not skill:
            return error_response('skill is required', status_code=400)

        gemini = GeminiAIService()
        notes = gemini.generate_skill_notes(skill)
        if not isinstance(notes, list):
            notes = []

        return success_response('AI notes generated successfully', {
            'notes': notes
        })
    except Exception as e:
        return error_response(f'Error generating notes: {str(e)}', status_code=500)


@roadmap_routes.route('/learning-plan', methods=['POST'])
@token_required
def generate_learning_plan(user, payload):
    """
    Generate detailed learning plan for specific skills
    
    Expected JSON:
    {
        "skills": ["Docker", "Kubernetes", "AWS"],
        "duration": 3
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        skills = data.get('skills', [])
        duration_months = data.get('duration', 3)
        
        if not skills:
            return error_response('skills is required', status_code=400)
        
        if duration_months < 1 or duration_months > 12:
            return error_response('duration must be between 1 and 12 months', status_code=422)
        
        youtube = YouTubeService()
        learning_plan = youtube.get_multiple_skills_learning_plan(skills)
        
        # Create structured plan
        structured_plan = {
            'totalDuration': duration_months,
            'skills': [],
            'milestones': []
        }
        
        weeks_per_skill = max(1, (duration_months * 4) // len(skills))
        
        for i, skill in enumerate(skills):
            resources = learning_plan.get(skill, [])
            structured_plan['skills'].append({
                'skill': skill,
                'startWeek': i * weeks_per_skill + 1,
                'endWeek': (i + 1) * weeks_per_skill,
                'resources': resources[:5],
                'projects': _get_practice_projects(skill)
            })
            
            structured_plan['milestones'].append({
                'week': (i + 1) * weeks_per_skill,
                'milestone': f'Master {skill}',
                'deliverable': f'Complete {skill} project'
            })
        
        return success_response('Learning plan generated successfully', {
            'learningPlan': structured_plan
        })
    
    except Exception as e:
        return error_response(f'Error generating learning plan: {str(e)}', status_code=500)


@roadmap_routes.route('/youtube-search', methods=['GET'])
@token_required
def youtube_search(user, payload):
    """
    Search YouTube tutorials
    """
    try:
        query = request.args.get('q', '')
        max_results = int(request.args.get('max', 9))
        
        if not query:
            return error_response('Query parameter q is required', status_code=400)
            
        youtube = YouTubeService()
        videos = youtube.search_skill_tutorials(query, max_results=max_results)
        
        # Check if we got fallbacks containing search results (suggesting quota/limit issue or fallback)
        is_fallback = False
        if videos and any(v.get('video_id') == '' or 'results?search_query' in v.get('url', '') for v in videos):
            is_fallback = True
            
        return success_response('YouTube search completed', {
            'videos': videos,
            'isFallback': is_fallback
        })
    except Exception as e:
        return error_response(f'Error searching YouTube: {str(e)}', status_code=500)


def _get_practice_projects(skill: str) -> List[str]:
    """Get practice project ideas for skill"""
    projects = {
        'Python': ['Build a web scraper', 'Create a CLI tool', 'Build a REST API'],
        'JavaScript': ['Build a todo app', 'Create a game', 'Build a dashboard'],
        'React': ['Build a e-commerce site', 'Create a social media feed', 'Build a task manager'],
        'Docker': ['Containerize an app', 'Create docker-compose setup', 'Build microservices'],
        'Kubernetes': ['Deploy to K8s cluster', 'Set up auto-scaling', 'Configure ingress'],
        'AWS': ['Set up EC2 instance', 'Create S3 storage', 'Set up Lambda functions'],
        'SQL': ['Design a database', 'Write complex queries', 'Optimize queries'],
        'Machine Learning': ['Build a classifier', 'Create a recommender', 'Build a NLP model']
    }
    
    for key, project_list in projects.items():
        if key.lower() in skill.lower():
            return project_list
    
    return [f'Build a {skill} project']


@roadmap_routes.route('/milestone/<milestone_id>', methods=['GET'])
@token_required
def get_milestone_details(user, payload, milestone_id):
    """
    Get detailed information for a specific milestone
    """
    try:
        # This would fetch milestone details from the generated roadmap
        # For now, return a sample milestone
        
        milestone_data = {
            'id': milestone_id,
            'title': 'Complete Kubernetes Certification',
            'description': 'Master container orchestration with Kubernetes',
            'duration': '4 weeks',
            'resources': [
                'Kubernetes official docs',
                'Linux Academy Kubernetes course',
                'Kubernetes the hard way tutorial'
            ],
            'practiceProjects': [
                'Deploy a multi-container application',
                'Set up persistent volumes',
                'Configure network policies'
            ],
            'assessmentCriteria': [
                'Successfully deploy app to K8s',
                'Demonstrate scaling and updates',
                'Explain K8s architecture'
            ]
        }
        
        return success_response('Milestone details retrieved', {
            'milestone': milestone_data
        })
    
    except Exception as e:
        return error_response(f'Error retrieving milestone: {str(e)}', status_code=500)
