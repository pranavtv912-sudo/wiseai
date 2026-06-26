"""
Service for AI Resume Builder
Handles AI generation, pre-filling from database, and PDF rendering using ReportLab.
"""
import io
import json
from flask import current_app
from services.gemini_service import GeminiAIService
from models.Resume import Resume, Analysis
from models.User import User
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.colors import HexColor

class ResumeBuilderService:
    def __init__(self):
        self.gemini = GeminiAIService()

    def get_prefill_data(self, user_id):
        """
        Prefills the resume builder form using the user's latest parsed resume.
        """
        user = User.query.get(user_id)
        latest_resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
        
        data = {
            "name": user.name if user else "",
            "email": user.email if user else "",
            "phone": user.phone if user else "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
            "summary": user.bio if user and user.bio else "",
            "skills": [],
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": []
        }

        if latest_resume:
            data["skills"] = latest_resume.extracted_skills if isinstance(latest_resume.extracted_skills, list) else []
            
            if latest_resume.extracted_education:
                if isinstance(latest_resume.extracted_education, list):
                    for edu in latest_resume.extracted_education:
                        if isinstance(edu, str):
                            data["education"].append({"institution": edu, "degree": "", "year": ""})
                        elif isinstance(edu, dict):
                            data["education"].append(edu)
                elif isinstance(latest_resume.extracted_education, str):
                     data["education"].append({"institution": latest_resume.extracted_education, "degree": "", "year": ""})
            
            if latest_resume.extracted_experience:
                if isinstance(latest_resume.extracted_experience, list):
                    for exp in latest_resume.extracted_experience:
                        if isinstance(exp, str):
                            data["experience"].append({"company": exp, "role": "", "duration": "", "description": ""})
                        elif isinstance(exp, dict):
                            data["experience"].append(exp)
            
            if latest_resume.extracted_projects:
                if isinstance(latest_resume.extracted_projects, list):
                     for proj in latest_resume.extracted_projects:
                        if isinstance(proj, str):
                             data["projects"].append({"name": proj, "description": ""})
                        elif isinstance(proj, dict):
                             data["projects"].append(proj)

        return data

    def ai_improve(self, action, text_data, role_context=""):
        """
        Uses Gemini to improve specific sections of the resume.
        """
        if not self.gemini.client:
            raise RuntimeError("Gemini client not initialized.")

        prompts = {
            "improve_summary": f"Rewrite this professional summary to be more ATS-friendly, impactful, and concise for a {role_context} role. Return ONLY the rewritten summary.\n\nInput: {text_data}",
            "improve_bullets": f"Rewrite these experience/project bullet points to use strong action verbs and highlight achievements with metrics if possible, tailored for a {role_context} role. Return ONLY the rewritten bullet points.\n\nInput: {text_data}",
            "generate_objective": f"Generate a compelling 2-sentence resume objective for a {role_context} role based on these skills/context: {text_data}. Return ONLY the generated objective."
        }

        prompt = prompts.get(action)
        if not prompt:
            raise ValueError("Invalid action specified.")

        try:
             response = self.gemini.client.models.generate_content(
                model=self.gemini.model_name,
                contents=prompt
             )
             if not response or not response.text:
                 raise ValueError("Failed to generate content.")
             return response.text.strip()
        except Exception as e:
             current_app.logger.error(f"Error in ai_improve: {str(e)}")
             raise RuntimeError("Failed to improve text via AI.")

    def generate_pdf(self, resume_data, template_style="Modern"):
        """
        Generates a PDF file using ReportLab based on the provided JSON data.
        Returns a BytesIO stream.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elements = []
        styles = getSampleStyleSheet()

        # Base Colors
        primary_color = HexColor("#000000")
        accent_color = HexColor("#3baf81") if template_style == "Modern" else HexColor("#333333")

        # Custom Styles
        title_style = ParagraphStyle(
            'NameTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=primary_color,
            spaceAfter=6,
            alignment=TA_CENTER if template_style == "Modern" else TA_LEFT
        )
        
        contact_style = ParagraphStyle(
            'ContactInfo',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor("#555555"),
            spaceAfter=12,
            alignment=TA_CENTER if template_style == "Modern" else TA_LEFT
        )
        
        section_title_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=accent_color,
            spaceBefore=12,
            spaceAfter=6,
            textTransform='uppercase'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=4
        )

        bold_style = ParagraphStyle(
            'CustomBold',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=2,
            fontName='Helvetica-Bold'
        )

        # Header (Name & Contact)
        name = resume_data.get("name", "Your Name")
        elements.append(Paragraph(f"<b>{name}</b>", title_style))
        
        contact_parts = []
        if resume_data.get("email"): contact_parts.append(resume_data.get("email"))
        if resume_data.get("phone"): contact_parts.append(resume_data.get("phone"))
        if resume_data.get("linkedin"): contact_parts.append(resume_data.get("linkedin"))
        if resume_data.get("github"): contact_parts.append(resume_data.get("github"))
        if resume_data.get("portfolio"): contact_parts.append(resume_data.get("portfolio"))
        
        contact_str = " | ".join(contact_parts)
        if contact_str:
            elements.append(Paragraph(contact_str, contact_style))

        if template_style != "Minimal":
            elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=12))

        # Summary
        if resume_data.get("summary"):
            elements.append(Paragraph("SUMMARY", section_title_style))
            elements.append(Paragraph(resume_data.get("summary").replace('\n', '<br/>'), normal_style))
            elements.append(Spacer(1, 12))

        # Experience
        experience = resume_data.get("experience", [])
        if experience:
            elements.append(Paragraph("PROFESSIONAL EXPERIENCE", section_title_style))
            for exp in experience:
                company = exp.get("company", "")
                role = exp.get("role", "")
                duration = exp.get("duration", "")
                desc = exp.get("description", "")
                
                header = f"<b>{role}</b> at <b>{company}</b>" if role else f"<b>{company}</b>"
                if duration:
                    header += f" | <i>{duration}</i>"
                    
                elements.append(Paragraph(header, bold_style))
                if desc:
                    elements.append(Paragraph(desc.replace('\n', '<br/>'), normal_style))
                elements.append(Spacer(1, 6))

        # Education
        education = resume_data.get("education", [])
        if education:
            elements.append(Paragraph("EDUCATION", section_title_style))
            for edu in education:
                inst = edu.get("institution", "")
                deg = edu.get("degree", "")
                year = edu.get("year", "")
                
                header = f"<b>{inst}</b>"
                if deg:
                    header += f" - {deg}"
                if year:
                    header += f" | <i>{year}</i>"
                elements.append(Paragraph(header, normal_style))
            elements.append(Spacer(1, 12))

        # Projects
        projects = resume_data.get("projects", [])
        if projects:
            elements.append(Paragraph("PROJECTS", section_title_style))
            for proj in projects:
                name = proj.get("name", "")
                desc = proj.get("description", "")
                
                elements.append(Paragraph(f"<b>{name}</b>", bold_style))
                if desc:
                    elements.append(Paragraph(desc.replace('\n', '<br/>'), normal_style))
                elements.append(Spacer(1, 6))

        # Skills
        skills = resume_data.get("skills", [])
        if skills:
            elements.append(Paragraph("SKILLS", section_title_style))
            skills_str = ", ".join(skills)
            elements.append(Paragraph(skills_str, normal_style))
            elements.append(Spacer(1, 12))

        # Certifications
        certs = resume_data.get("certifications", [])
        if certs:
            elements.append(Paragraph("CERTIFICATIONS", section_title_style))
            certs_str = ", ".join(certs)
            elements.append(Paragraph(certs_str, normal_style))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
