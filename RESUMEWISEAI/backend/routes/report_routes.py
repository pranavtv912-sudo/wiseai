"""
Report Generation Routes
Handles PDF report generation and download
"""

from flask import Blueprint, request, send_file
from models import User, Resume, Report, db
from utils import token_required, success_response, error_response
from services import ReportGenerator, GeminiAIService, AdzunaService, EmailService
from datetime import datetime
import os
import json

report_routes = Blueprint('report', __name__, url_prefix='/api/report')


@report_routes.route('/generate', methods=['POST'])
@token_required
def generate_report(user, payload):
    """
    Generate comprehensive PDF report
    
    Expected JSON:
    {
        "resumeId": "resume-id"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        resume_id = data.get('resumeId')
        
        if not resume_id:
            return error_response('resumeId is required', status_code=400)
        
        # Get resume
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        if not resume.is_analyzed:
            return error_response('Resume must be analyzed first', status_code=400)
        
        # Prepare report data
        user_data = user.to_dict()
        resume_data = {
            'skills': resume.extracted_skills,
            'projects': resume.extracted_projects,
            'experience': resume.extracted_experience,
            'education': resume.extracted_education,
            'certifications': resume.extracted_certifications,
            'raw_text': resume.extracted_text
        }
        
        analysis_data = resume.analysis.to_detailed_dict() if resume.analysis else {}
        
        # Get AI feedback
        gemini = GeminiAIService()
        ai_feedback = {
            'summary': gemini.generate_resume_summary(resume.extracted_text),
            'strengths': resume.analysis.strengths if resume.analysis else [],
            'weaknesses': resume.analysis.weaknesses if resume.analysis else [],
            'improvement_suggestions': resume.analysis.improvement_suggestions if resume.analysis else [],
            'career_guidance': gemini.generate_career_guidance(resume_data, resume.target_role),
            'interview_questions': gemini.generate_interview_questions(
                resume.extracted_skills,
                resume.target_role or 'Developer',
                10
            ),
            'career_roadmap': gemini.generate_career_roadmap(
                resume.extracted_skills,
                resume.target_role or 'Software Developer',
                12
            )
        }
        
        # Add course recommendations
        from services import YouTubeService
        youtube = YouTubeService()
        missing_skills_list = (analysis_data.get('missing_skills') or resume.extracted_skills or [])[:5]
        course_recommendations = youtube.get_multiple_skills_learning_plan(missing_skills_list) if missing_skills_list else {}
        
        ai_feedback['course_recommendations'] = course_recommendations
        
        # Generate report
        report_generator = ReportGenerator()
        report_data = report_generator.generate_comprehensive_report(
            user_data,
            resume_data,
            analysis_data,
            ai_feedback
        )
        
        # Create report record
        report = Report(
            user_id=user.id,
            resume_id=resume_id,
            report_title=f'Resume Analysis Report - {user.name}',
            report_data=json.dumps(report_data, default=str),
            ats_score_data=analysis_data.get('score_breakdown'),
            skills_analysis_data={
                'matching': analysis_data.get('matching_skills', []),
                'missing': analysis_data.get('missing_skills', [])
            },
            ai_feedback_data={
                'summary': ai_feedback.get('summary', ''),
                'strengths': ai_feedback.get('strengths', []),
                'weaknesses': ai_feedback.get('weaknesses', [])
            },
            interview_questions_data=ai_feedback.get('interview_questions', []),
            career_roadmap_data=ai_feedback.get('career_roadmap', {}),
            course_recommendations_data=ai_feedback.get('course_recommendations', {}),
            status='generated'
        )
        
        db.session.add(report)
        db.session.commit()
        
        return success_response('Report generated successfully', {
            'report': report.to_dict(),
            'reportData': report_data
        }, status_code=201)
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error generating report: {str(e)}', status_code=500)


@report_routes.route('/<report_id>', methods=['GET'])
@token_required
def get_report(user, payload, report_id):
    """
    Get report details
    """
    try:
        report = Report.query.filter_by(id=report_id, user_id=user.id).first()
        
        if not report:
            return error_response('Report not found', status_code=404)
        
        return success_response('Report retrieved successfully', {
            'report': report.to_detailed_dict()
        })
    
    except Exception as e:
        return error_response(f'Error retrieving report: {str(e)}', status_code=500)


@report_routes.route('/<report_id>/download', methods=['GET'])
@token_required
def download_report(user, payload, report_id):
    """
    Download report as PDF
    """
    try:
        report = Report.query.filter_by(id=report_id, user_id=user.id).first()
        
        if not report:
            return error_response('Report not found', status_code=404)
        
        # Generate PDF if not already saved
        from services import ReportGenerator
        report_generator = ReportGenerator()
        
        report_data = json.loads(report.report_data) if isinstance(report.report_data, str) else report.report_data
        pdf_content = report_generator.generate_pdf_content(report_data)
        
        # Save to temporary location if needed
        from io import BytesIO
        pdf_buffer = BytesIO(pdf_content)
        
        # Update download count
        report.download_count += 1
        report.is_downloaded = True
        db.session.commit()
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'ResumeAnalysis_{report.id}.pdf'
        )
    
    except Exception as e:
        return error_response(f'Error downloading report: {str(e)}', status_code=500)


@report_routes.route('/<report_id>/export', methods=['GET'])
@token_required
def export_report(user, payload, report_id):
    """
    Export report as JSON
    
    Query params:
    - format: 'json' (default) or 'csv'
    """
    try:
        report = Report.query.filter_by(id=report_id, user_id=user.id).first()
        
        if not report:
            return error_response('Report not found', status_code=404)
        
        format_type = request.args.get('format', 'json').lower()
        
        if format_type == 'json':
            report_data = json.loads(report.report_data) if isinstance(report.report_data, str) else report.report_data
            
            return success_response('Report exported successfully', {
                'report': report_data
            })
        else:
            return error_response('Unsupported export format', status_code=400)
    
    except Exception as e:
        return error_response(f'Error exporting report: {str(e)}', status_code=500)


@report_routes.route('/list', methods=['GET'])
@token_required
def list_reports(user, payload):
    """
    List all reports for user
    
    Query params:
    - page: Page number (default 1)
    - per_page: Items per page (default 20)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        reports = Report.query.filter_by(user_id=user.id).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        report_list = [r.to_dict() for r in reports.items]
        
        return success_response('Reports retrieved successfully', {
            'reports': report_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reports.total,
                'pages': reports.pages
            }
        })
    
    except Exception as e:
        return error_response(f'Error listing reports: {str(e)}', status_code=500)


@report_routes.route('/<report_id>', methods=['DELETE'])
@token_required
def delete_report(user, payload, report_id):
    """
    Delete report
    """
    try:
        report = Report.query.filter_by(id=report_id, user_id=user.id).first()
        
        if not report:
            return error_response('Report not found', status_code=404)
        
        db.session.delete(report)
        db.session.commit()
        
        return success_response('Report deleted successfully')
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error deleting report: {str(e)}', status_code=500)


@report_routes.route('/send-email', methods=['POST'])
@token_required
def send_email_report(user, payload):
    """
    Send report email using EmailJS
    Expected JSON:
    {
        "email": "...",
        "atsScore": 85,
        "strengths": [...],
        "missingSkills": [...],
        "suggestions": [...]
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)

        recipient_email = data.get('email', '').strip()
        ats_score = data.get('atsScore')
        strengths = data.get('strengths', [])
        missing_skills = data.get('missingSkills', [])
        suggestions = data.get('suggestions', [])

        if not recipient_email:
            return error_response('email is required', status_code=400)
        if ats_score is None:
            return error_response('atsScore is required', status_code=400)

        try:
            ats_score = float(ats_score)
        except (TypeError, ValueError):
            return error_response('atsScore must be a number', status_code=422)

        email_service = EmailService()
        template_params = {
            'to_email': recipient_email,
            'ats_score': ats_score,
            'strengths': strengths,
            'missing_skills': missing_skills,
            'suggestions': suggestions,
            'user_name': user.name or ''
        }
        email_service.send_email(recipient_email, template_params)

        return success_response('Email sent successfully', {
            'message': 'Email sent successfully'
        })
    except Exception as e:
        return error_response(f'Error sending email: {str(e)}', status_code=500)
