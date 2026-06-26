"""
Resume Analysis Routes
Handles comprehensive resume analysis with ATS scoring and feedback
"""

from flask import Blueprint, current_app, request
from models import User, Resume, Analysis, db
from utils import token_required, success_response, error_response
from services import ResumeParser, ATSScoreCalculator, GeminiAIService, AdzunaService, EmailService
from datetime import datetime

analysis_routes = Blueprint('analysis', __name__, url_prefix='/api/analyze')


@analysis_routes.route('/', methods=['POST'])
@token_required
def analyze_resume(user, payload):
    """
    Comprehensive resume analysis endpoint
    
    Expected JSON:
    {
        "resumeId": "resume-id",
        "targetRole": "Python Developer"
    }
    
    Returns:
    {
        "atsScore": 84,
        "skills": ["Python", "Flask", "MySQL"],
        "missingSkills": ["Docker", "Git", "React"],
        "strengths": [...],
        "weaknesses": [...],
        "suggestions": [...],
        "marketData": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        resume_id = data.get('resumeId')
        target_role = data.get('targetRole')
        
        if not resume_id:
            return error_response('resumeId is required', status_code=400)
        
        # Get resume
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        # Parse resume if not already done
        if not resume.extracted_text:
            parser = ResumeParser()
            parsed_data = parser.parse_resume(resume.file_path)
            
            if 'error' in parsed_data:
                return error_response(f'Error parsing resume: {parsed_data["error"]}', status_code=400)
            
            resume.extracted_text = parsed_data.get('raw_text', '')
            resume.extracted_skills = parsed_data.get('skills', [])
            resume.extracted_experience = parsed_data.get('experience', [])
            resume.extracted_education = parsed_data.get('education', [])
            resume.extracted_certifications = parsed_data.get('certifications', [])
            resume.extracted_projects = parsed_data.get('projects', [])
        
        # Calculate ATS score
        ats_calculator = ATSScoreCalculator()
        ats_data = ats_calculator.calculate_ats_score(
            {
                'skills': resume.extracted_skills,
                'projects': resume.extracted_projects,
                'certifications': resume.extracted_certifications,
                'keywords': [],
                'raw_text': resume.extracted_text
            },
            target_role
        )
        
        # Get skill gap analysis
        skill_gap = ats_calculator.get_skill_gap_analysis(
            resume.extracted_skills,
            target_role or 'Python Developer'
        )
        
        # Get market data
        adzuna = AdzunaService()
        market_data = adzuna.get_job_market_data(target_role or 'Developer')
        
        # Generate AI feedback
        gemini = GeminiAIService()
        
        resume_data = {
            'skills': resume.extracted_skills,
            'projects': resume.extracted_projects,
            'certifications': resume.extracted_certifications,
            'experience': resume.extracted_experience,
            'raw_text': resume.extracted_text
        }
        
        print("\n========== ANALYSIS DEBUG ==========")
        print("RESUME DATA:", resume_data)
        print("====================================")
        
        strengths = gemini.generate_strengths(resume_data)
        print(f"[DEBUG] GENERATED STRENGTHS: {strengths}")
        print(f"[DEBUG] STRENGTHS TYPE: {type(strengths)}")
        print(f"[DEBUG] STRENGTHS LENGTH: {len(strengths)}")
        
        weaknesses = gemini.generate_weaknesses(resume_data, target_role or 'Developer')
        print(f"[DEBUG] GENERATED WEAKNESSES: {weaknesses}")
        
        suggestions = gemini.generate_improvement_suggestions(resume_data, ats_data['total_score'])
        print(f"[DEBUG] GENERATED SUGGESTIONS: {suggestions}")
        print(f"[DEBUG] SUGGESTIONS TYPE: {type(suggestions)}")
        print(f"[DEBUG] SUGGESTIONS LENGTH: {len(suggestions)}")
        print("====================================\n")
        
        # Create or update analysis record
        analysis = Analysis.query.filter_by(resume_id=resume_id).first()
        if not analysis:
            analysis = Analysis(resume_id=resume_id)
        
        # Update analysis with results
        analysis.skills_match_score = ats_data['score_breakdown'].get('skills_match', 0)
        analysis.projects_score = ats_data['score_breakdown'].get('projects', 0)
        analysis.certifications_score = ats_data['score_breakdown'].get('certifications', 0)
        analysis.keywords_score = ats_data['score_breakdown'].get('keywords', 0)
        analysis.formatting_score = ats_data['score_breakdown'].get('formatting', 0)
        analysis.total_ats_score = ats_data['total_score']
        
        analysis.matching_skills = skill_gap.get('matching_skills', [])
        analysis.missing_required_skills = skill_gap.get('missing_required_skills', [])
        analysis.missing_preferred_skills = skill_gap.get('missing_preferred_skills', [])
        analysis.missing_skills = analysis.missing_required_skills
        analysis.recommended_skills = analysis.missing_preferred_skills
        
        analysis.strengths = strengths
        analysis.weaknesses = weaknesses
        analysis.improvement_suggestions = suggestions
        
        analysis.job_trends = market_data.get('job_trends', {})
        analysis.salary_data = market_data.get('salary_data', {})
        analysis.required_skills = adzuna.get_required_skills(target_role or 'Developer')
        
        # Update resume
        resume.ats_score = ats_data['total_score']
        resume.target_role = target_role
        resume.is_analyzed = True
        resume.analysis_status = 'completed'
        resume.analyzed_at = datetime.utcnow()
        
        db.session.add(analysis)
        db.session.commit()

        # ================= DEBUG LOGS =================
        
        print("\n========== SKILL GAP DEBUG ==========")
        print("SKILL GAP DATA:", skill_gap)
        print("COVERAGE PERCENTAGE:", skill_gap.get('coverage_percentage', 0))
        print("====================================\n")
        
        # Try to send email, but don't fail the analysis if email fails
        try:
            print("\n========== EMAIL SEND DEBUG ==========")
            print("EMAIL STRENGTHS:", strengths)
            print("EMAIL SUGGESTIONS:", suggestions)
            print("EMAIL COVERAGE:", skill_gap.get('coverage_percentage', 0))
            print("EMAIL MISSING SKILLS:", analysis.missing_required_skills)
            print("====================================\n")
            
            email_service = EmailService()
            email_service.send_analysis_email(
                to_email=user.email,
                name=user.name or '',
                target_role=target_role or '',
                ats_score=ats_data['total_score'],
                strengths=strengths,
                missing_skills=analysis.missing_required_skills,
                suggestions=suggestions,
                skill_coverage=skill_gap.get('coverage_percentage', 0)
            )
        except Exception as email_error:
            current_app.logger.error(f'EmailJS send_analysis_email failed: {str(email_error)}')
        
        return success_response('Resume analysis completed', {
            'analysis': {
                'atsScore': ats_data['total_score'],
                'scoreBreakdown': ats_data['score_breakdown'],
                'weightedScores': ats_data['weighted_scores'],
                'matchingSkills': analysis.matching_skills,
                'missingRequiredSkills': analysis.missing_required_skills,
                'missingPreferredSkills': analysis.missing_preferred_skills,
                'strengths': strengths,
                'weaknesses': weaknesses,
                'suggestions': suggestions,
                'marketData': {
                    'jobTrends': market_data.get('job_trends', {}),
                    'salaryData': market_data.get('salary_data', {}),
                    'requiredSkills': analysis.required_skills
                },
                'targetRole': target_role or 'Not specified',
                'skillCoverage': skill_gap.get('coverage_percentage', 0)
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Analysis error: {str(e)}', status_code=500)


@analysis_routes.route('/<resume_id>', methods=['GET'])
@token_required
def get_analysis(user, payload, resume_id):
    """
    Get analysis results for a resume
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        if not resume.analysis:
            return error_response('Analysis not found. Run analysis first.', status_code=404)
        
        return success_response('Analysis retrieved successfully', {
            'analysis': resume.analysis.to_dict()
        })
    
    except Exception as e:
        return error_response(f'Error retrieving analysis: {str(e)}', status_code=500)


@analysis_routes.route('/<resume_id>/skill-gap', methods=['GET'])
@token_required
def get_skill_gap(user, payload, resume_id):
    """
    Get skill gap analysis for resume
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        if not resume.analysis:
            return error_response('Analysis not found. Run analysis first.', status_code=404)
        
        target_role = resume.target_role or 'Python Developer'
        ats_calculator = ATSScoreCalculator()
        
        skill_gap = ats_calculator.get_skill_gap_analysis(
            resume.extracted_skills,
            target_role
        )
        
        return success_response('Skill gap analysis retrieved', {
            'skillGap': skill_gap
        })
    
    except Exception as e:
        return error_response(f'Error getting skill gap: {str(e)}', status_code=500)
