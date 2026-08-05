"""
Interview Preparation Routes
Generates interview questions and provides interview preparation resources
"""

from flask import Blueprint, request
from models import User, Resume
from utils import token_required, success_response, error_response
from services import GeminiAIService

interview_routes = Blueprint('interview', __name__, url_prefix='/api/interview')


@interview_routes.route('/generate', methods=['POST'])
@token_required
def generate_interview_questions(user, payload):
    """
    Generate interview questions for target role
    
    Expected JSON:
    {
        "role": "Python Developer",
        "experience": "mid",
        "count": 10
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        role = data.get('role', 'Software Developer')
        experience = data.get('experience', 'mid')
        count = data.get('count', 10)
        
        if count < 1 or count > 30:
            return error_response('count must be between 1 and 30', status_code=422)
        
        # For now, return sample questions based on role
        # In production, use GeminiAIService
        gemini = GeminiAIService()
        
        # Get user's skills if available
        resumes = Resume.query.filter_by(user_id=user.id).first()
        skills = resumes.extracted_skills if resumes and resumes.extracted_skills else ['Problem Solving', 'Communication']
        
        questions = gemini.generate_interview_questions(skills, role, count)
        
        if not questions:
            questions = _get_default_interview_questions(role, experience, count)
        
        return success_response('Interview questions generated', {
            'questions': questions,
            'role': role,
            'experience': experience,
            'totalQuestions': len(questions),
            'categories': _categorize_questions(questions)
        })
    
    except Exception as e:
        return error_response(f'Error generating questions: {str(e)}', status_code=500)


@interview_routes.route('/resume-based', methods=['POST'])
@token_required
def generate_resume_based_questions(user, payload):
    """
    Generate interview questions based on resume content
    
    Expected JSON:
    {
        "resumeId": "resume-id",
        "targetRole": "Python Developer"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        resume_id = data.get('resumeId')
        target_role = data.get('targetRole', 'Software Developer')
        
        if not resume_id:
            return error_response('resumeId is required', status_code=400)
        
        # Get resume
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        # Generate questions specific to resume content
        gemini = GeminiAIService()
        questions = gemini.generate_interview_questions(
            resume.extracted_skills or [],
            target_role,
            15
        )
        
        if not questions:
            questions = _get_default_interview_questions(target_role, 'mid', 10)
        
        return success_response('Resume-based interview questions generated', {
            'questions': questions,
            'resumeHighlights': {
                'skills': resume.extracted_skills[:8],
                'experience': resume.extracted_experience[:2],
                'projects': [p.get('name', '') for p in resume.extracted_projects[:3]]
            },
            'targetRole': target_role
        })
    
    except Exception as e:
        return error_response(f'Error generating questions: {str(e)}', status_code=500)


@interview_routes.route('/tips', methods=['GET'])
@token_required
def get_interview_tips(user, payload):
    """
    Get general interview preparation tips
    
    Query params:
    - role: Target role
    - experience: Experience level (junior, mid, senior)
    """
    try:
        role = request.args.get('role', 'Software Developer')
        experience = request.args.get('experience', 'mid')
        
        tips = _get_interview_tips(role, experience)
        
        return success_response('Interview tips retrieved', {
            'tips': tips,
            'role': role,
            'experience': experience
        })
    
    except Exception as e:
        return error_response(f'Error retrieving tips: {str(e)}', status_code=500)


@interview_routes.route('/behavioral-questions', methods=['GET'])
@token_required
def get_behavioral_questions(user, payload):
    """
    Get behavioral interview questions
    """
    try:
        questions = [
            'Tell me about a challenging situation you\'ve faced and how you overcame it.',
            'Describe a time when you worked effectively as a team.',
            'Give an example of when you showed leadership.',
            'Tell me about a time you made a mistake and how you handled it.',
            'Describe a situation where you had to adapt to change.',
            'Tell me about your greatest professional achievement.',
            'Describe a time you had to meet a tight deadline.',
            'Tell me about a conflict with a colleague and how you resolved it.'
        ]
        
        tips = [
            'Use the STAR method (Situation, Task, Action, Result)',
            'Be specific with examples and metrics',
            'Show your problem-solving process',
            'Highlight teamwork and collaboration',
            'Focus on what you learned from the experience',
            'Keep answers concise but detailed'
        ]
        
        return success_response('Behavioral questions retrieved', {
            'questions': questions,
            'tips': tips
        })
    
    except Exception as e:
        return error_response(f'Error retrieving questions: {str(e)}', status_code=500)


@interview_routes.route('/technical-questions', methods=['GET'])
@token_required
def get_technical_questions(user, payload):
    """
    Get technical interview questions
    
    Query params:
    - skill: Technical skill to focus on
    """
    try:
        skill = request.args.get('skill', 'Python')
        
        technical_questions = {
            'Python': [
                'Explain the difference between list and tuple in Python.',
                'What is a lambda function?',
                'Explain decorators in Python.',
                'What is the GIL (Global Interpreter Lock)?',
                'Explain list comprehensions with an example.',
                'What is the difference between deepcopy and shallow copy?',
                'How does Python handle memory management?',
                'What are generators and how do they work?'
            ],
            'JavaScript': [
                'Explain closures in JavaScript.',
                'What is hoisting?',
                'Explain the event loop.',
                'What is the difference between var, let, and const?',
                'Explain async/await.',
                'What is callback hell and how do you prevent it?',
                'Explain prototypal inheritance.',
                'What are promises?'
            ],
            'SQL': [
                'Explain the difference between INNER JOIN and LEFT JOIN.',
                'What are indexes and why are they important?',
                'Explain normalization.',
                'What is a subquery?',
                'Explain transactions and ACID properties.',
                'What is the difference between GROUP BY and HAVING?',
                'How do you optimize slow queries?',
                'What is a view in SQL?'
            ],
            'React': [
                'Explain the Virtual DOM.',
                'What are hooks and why were they introduced?',
                'Explain the useState hook.',
                'What is the useEffect hook used for?',
                'Explain component lifecycle in React.',
                'What is prop drilling and how do you avoid it?',
                'Explain controlled vs uncontrolled components.',
                'What is React.Fragment?'
            ]
        }
        
        questions = technical_questions.get(skill, technical_questions['Python'])
        
        return success_response('Technical questions retrieved', {
            'questions': questions,
            'skill': skill,
            'totalQuestions': len(questions)
        })
    
    except Exception as e:
        return error_response(f'Error retrieving questions: {str(e)}', status_code=500)


def _get_default_interview_questions(role: str, experience: str, count: int) -> list:
    """Get default interview questions"""
    questions = [
        f'Why are you interested in a {role} position?',
        'What are your greatest strengths relevant to this role?',
        'What areas do you want to improve in your career?',
        'Tell me about a challenging project you worked on.',
        'How do you stay updated with the latest technologies?',
        'Describe your approach to problem-solving.',
        'How do you handle working in a team environment?',
        'What is your experience with [relevant technology]?',
        'Tell me about a time you had to learn something new quickly.',
        'What are your salary expectations?'
    ]
    
    return questions[:count]


def _categorize_questions(questions: list) -> dict:
    """Categorize interview questions"""
    return {
        'technical': [q for q in questions if any(keyword in q.lower() for keyword in ['code', 'language', 'algorithm', 'data structure'])],
        'behavioral': [q for q in questions if any(keyword in q.lower() for keyword in ['tell me', 'experience', 'situation', 'challenge'])],
        'situational': [q for q in questions if any(keyword in q.lower() for keyword in ['how would you', 'what would you', 'scenario'])]
    }


def _get_interview_tips(role: str, experience: str) -> list:
    """Get interview preparation tips"""
    general_tips = [
        'Arrive 15 minutes early to the interview',
        'Research the company thoroughly before the interview',
        'Prepare examples of your past accomplishments',
        'Practice your answers but don\'t memorize them',
        'Prepare thoughtful questions for the interviewer',
        'Dress professionally and appropriately',
        'Make eye contact and provide firm handshakes',
        'Follow up with a thank you email within 24 hours'
    ]
    
    role_specific_tips = {
        'Developer': [
            'Be ready to code or solve problems on the spot',
            'Discuss your GitHub or portfolio projects',
            'Explain your technical decision-making process',
            'Be prepared to discuss past projects in detail'
        ],
        'Designer': [
            'Bring a portfolio of your best work',
            'Be ready to explain your design process',
            'Discuss how you approach user research',
            'Prepare for design critique questions'
        ],
        'Manager': [
            'Share examples of how you\'ve led teams',
            'Discuss your management philosophy',
            'Be ready to explain conflict resolution approaches',
            'Prepare for questions about metrics and results'
        ]
    }
    
    tips = general_tips.copy()
    
    for key, role_tips in role_specific_tips.items():
        if key.lower() in role.lower():
            tips.extend(role_tips)
    
    return tips


@interview_routes.route('/evaluate', methods=['POST'])
@token_required
def evaluate_answer(user, payload):
    """
    Evaluate candidate's answer to a question
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        question = data.get('question')
        answer = data.get('answer')
        mode = data.get('mode', 'Technical')
        
        if not question or not answer:
            return error_response('question and answer are required', status_code=400)
            
        gemini = GeminiAIService()
        evaluation = gemini.evaluate_interview_answer(question, answer, mode)
        
        return success_response('Evaluation completed', {
            'evaluation': evaluation
        })
    except Exception as e:
        return error_response(f'Error evaluating answer: {str(e)}', status_code=500)

