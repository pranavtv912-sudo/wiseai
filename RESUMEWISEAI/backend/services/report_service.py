"""
PDF Report Generation Service
Generates comprehensive PDF reports with analysis results
"""

from io import BytesIO
from datetime import datetime
from typing import Dict, List
import json
from flask import current_app


class ReportGenerator:
    """Service for generating PDF reports"""
    
    def __init__(self):
        """Initialize report generator"""
        self.report_data = {}
    
    def generate_comprehensive_report(self, user_data: Dict, resume_data: Dict, 
                                     analysis_data: Dict, ai_feedback: Dict) -> Dict:
        """
        Generate comprehensive analysis report
        
        Args:
            user_data: User information
            resume_data: Extracted resume data
            analysis_data: ATS analysis results
            ai_feedback: AI-generated feedback
            
        Returns:
            Dictionary with report data and metadata
        """
        try:
            report = {
                'generated_at': datetime.utcnow().isoformat(),
                'user': {
                    'name': user_data.get('name', 'N/A'),
                    'email': user_data.get('email', 'N/A'),
                    'target_role': user_data.get('target_role', 'Not specified')
                },
                'resume_analysis': {
                    'ats_score': analysis_data.get('total_ats_score', 0),
                    'score_breakdown': analysis_data.get('score_breakdown', {}),
                    'weighted_scores': analysis_data.get('weighted_scores', {}),
                },
                'extracted_content': {
                    'skills': (resume_data.get('skills') or [])[:15],
                    'experience': (resume_data.get('experience') or [])[:5],
                    'education': (resume_data.get('education') or [])[:3],
                    'certifications': resume_data.get('certifications') or [],
                    'projects': (resume_data.get('projects') or [])[:5],
                },
                'skill_analysis': {
                    'matching_skills': analysis_data.get('matching_skills') or [],
                    'missing_required_skills': analysis_data.get('missing_required_skills') or [],
                    'missing_preferred_skills': analysis_data.get('missing_preferred_skills') or [],
                    'coverage_percentage': analysis_data.get('coverage_percentage', 0),
                },
                'ai_feedback': {
                    'summary': ai_feedback.get('summary', ''),
                    'strengths': ai_feedback.get('strengths') or [],
                    'weaknesses': ai_feedback.get('weaknesses') or [],
                    'improvement_suggestions': ai_feedback.get('improvement_suggestions') or [],
                    'career_guidance': ai_feedback.get('career_guidance', ''),
                },
                'market_insights': {
                    'job_trends': analysis_data.get('job_trends') or {},
                    'salary_data': analysis_data.get('salary_data') or {},
                    'required_skills': analysis_data.get('required_skills') or [],
                },
                'interview_preparation': {
                    'questions': (ai_feedback.get('interview_questions') or [])[:10],
                    'tips': self._generate_interview_tips(resume_data, ai_feedback),
                },
                'learning_roadmap': ai_feedback.get('career_roadmap') or {},
                'course_recommendations': ai_feedback.get('course_recommendations') or [],
            }
            
            return report
        
        except Exception as e:
            print(f'Error generating report: {str(e)}')
            return {'error': str(e)}
    
    def _generate_interview_tips(self, resume_data: Dict, ai_feedback: Dict) -> List[str]:
        """Generate interview preparation tips"""
        tips = [
            'Prepare specific examples showcasing your key projects and accomplishments',
            'Practice explaining your technical skills in simple, clear language',
            'Prepare questions about the company, team, and role to ask your interviewer',
            'Research the company thoroughly and understand their business',
            'Practice the STAR method (Situation, Task, Action, Result) for behavioral questions',
            'Be ready to discuss your weaknesses and how you\'re addressing them',
            'Have copies of your resume and portfolio ready',
            'Get good sleep before the interview and arrive 15 minutes early'
        ]
        
        # Add skill-specific tips
        skills = resume_data.get('skills', [])
        if 'Python' in skills:
            tips.append('Be prepared to discuss Python design patterns and optimization techniques')
        if 'React' in skills:
            tips.append('Practice explaining React component lifecycle and hooks concepts')
        if 'Database' in skills or 'SQL' in skills:
            tips.append('Prepare to write and optimize SQL queries on the spot')
        
        return tips[:8]
    
    def generate_pdf_content(self, report_data: Dict) -> bytes:
        """
        Generate PDF binary content from report
        
        Args:
            report_data: Report data dictionary
            
        Returns:
            PDF file bytes
        """
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            
            # Create PDF in memory
            pdf_buffer = BytesIO()
            doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1f4788'),
                spaceAfter=30,
                alignment=1
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#2e5c8a'),
                spaceAfter=12,
                spaceBefore=12
            )
            
            # Title
            story.append(Paragraph('ResumeWise AI - Resume Analysis Report', title_style))
            story.append(Spacer(1, 0.2*inch))
            
            # User Info
            user_info = report_data.get('user', {})
            story.append(Paragraph(f"Candidate: {user_info.get('name', 'N/A')}", heading_style))
            story.append(Paragraph(f"Email: {user_info.get('email', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"Target Role: {user_info.get('target_role', 'N/A')}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
            
            # ATS Score
            story.append(Paragraph('ATS Score Analysis', heading_style))
            ats_score = report_data.get('resume_analysis', {}).get('ats_score', 0)
            story.append(Paragraph(f'Overall ATS Score: <b>{ats_score}/100</b>', styles['Normal']))
            
            score_breakdown = report_data.get('resume_analysis', {}).get('score_breakdown', {})
            breakdown_text = f"""
            Skills Match: {score_breakdown.get('skills_match', 0)}/100<br/>
            Projects: {score_breakdown.get('projects', 0)}/100<br/>
            Certifications: {score_breakdown.get('certifications', 0)}/100<br/>
            Keywords: {score_breakdown.get('keywords', 0)}/100<br/>
            Formatting: {score_breakdown.get('formatting', 0)}/100
            """
            story.append(Paragraph(breakdown_text, styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
            
            # Skills Analysis
            story.append(Paragraph('Skills Analysis', heading_style))
            skills_data = report_data.get('skill_analysis') or {}
            matching_skills = ', '.join((skills_data.get('matching_skills') or [])[:10])
            missing_skills = ', '.join((skills_data.get('missing_required_skills') or [])[:5])
            
            story.append(Paragraph(f'<b>Matching Skills:</b> {matching_skills}', styles['Normal']))
            story.append(Paragraph(f'<b>Missing Skills:</b> {missing_skills}', styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
            
            # AI Feedback
            story.append(Paragraph('AI-Generated Feedback', heading_style))
            ai_feedback = report_data.get('ai_feedback') or {}
            
            if ai_feedback.get('summary'):
                story.append(Paragraph(f'<b>Summary:</b> {ai_feedback["summary"][:300]}...', styles['Normal']))
            
            story.append(PageBreak())
            
            # Strengths
            story.append(Paragraph('Your Strengths', heading_style))
            strengths = ai_feedback.get('strengths') or []
            for strength in strengths[:5]:
                story.append(Paragraph(f'• {strength}', styles['Normal']))
            
            # Improvement Areas
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph('Areas for Improvement', heading_style))
            weaknesses = ai_feedback.get('weaknesses') or []
            for weakness in weaknesses[:5]:
                story.append(Paragraph(f'• {weakness}', styles['Normal']))
            
            story.append(PageBreak())
            
            # Interview Questions
            story.append(Paragraph('Interview Preparation', heading_style))
            questions = (report_data.get('interview_preparation') or {}).get('questions') or []
            story.append(Paragraph('<b>Sample Interview Questions:</b>', styles['Normal']))
            for i, question in enumerate(questions[:5], 1):
                story.append(Paragraph(f'{i}. {question}', styles['Normal']))
            
            # Build PDF
            doc.build(story)
            pdf_buffer.seek(0)
            
            return pdf_buffer.getvalue()
        
        except Exception as e:
            print(f'Error generating PDF: {str(e)}')
            return b''
    
    def export_report_as_json(self, report_data: Dict) -> str:
        """
        Export report as JSON string
        
        Args:
            report_data: Report data dictionary
            
        Returns:
            JSON string
        """
        try:
            return json.dumps(report_data, indent=2, default=str)
        except Exception as e:
            print(f'Error exporting JSON: {str(e)}')
            return '{}'
    
    def save_report_file(self, report_data: Dict, file_path: str, file_format: str = 'pdf') -> bool:
        """
        Save report to file
        
        Args:
            report_data: Report data
            file_path: Path to save file
            file_format: 'pdf' or 'json'
            
        Returns:
            Boolean indicating success
        """
        try:
            import os
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            if file_format == 'pdf':
                pdf_content = self.generate_pdf_content(report_data)
                with open(file_path, 'wb') as f:
                    f.write(pdf_content)
            elif file_format == 'json':
                json_content = self.export_report_as_json(report_data)
                with open(file_path, 'w') as f:
                    f.write(json_content)
            
            return True
        
        except Exception as e:
            print(f'Error saving report: {str(e)}')
            return False
