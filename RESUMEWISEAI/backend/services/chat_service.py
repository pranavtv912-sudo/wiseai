"""
Service for the AI Resume Career Assistant
"""
from typing import Dict, Any, List
from flask import current_app
from services.gemini_service import GeminiAIService
from models.Resume import Resume, Analysis

class ChatService:
    def __init__(self):
        self.gemini_service = GeminiAIService()

    def get_chat_response(self, user_id: str, message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """
        Generate a response for the AI Career Assistant.
        Automatically injects the user's latest resume context if available.
        """
        if not self.gemini_service.client:
            raise RuntimeError("Gemini client is not initialized (missing API key).")

        # Fetch the user's latest parsed resume
        latest_resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
        
        context_str = "The user has not uploaded a resume yet."
        if latest_resume:
            skills = latest_resume.extracted_skills or []
            ats_score = latest_resume.ats_score or "Unknown"
            role = latest_resume.target_role or "Unknown"
            
            context_str = f"""
USER'S CURRENT RESUME CONTEXT:
- Target Role: {role}
- Current ATS Score: {ats_score}
- Extracted Skills: {', '.join(skills) if skills else 'None'}
"""
            # Add analysis details if available
            analysis = Analysis.query.filter_by(resume_id=latest_resume.id).first()
            if analysis:
                try:
                    import json
                    if isinstance(analysis.missing_skills, str):
                        missing = json.loads(analysis.missing_skills)
                    else:
                        missing = analysis.missing_skills
                        
                    if isinstance(analysis.matching_skills, str):
                        matching = json.loads(analysis.matching_skills)
                    else:
                        matching = analysis.matching_skills
                        
                    context_str += f"- Missing Skills for role: {', '.join(missing) if missing else 'None'}\n"
                    context_str += f"- Matching Skills for role: {', '.join(matching) if matching else 'None'}\n"
                except Exception as e:
                    pass

        system_prompt = f"""
You are the "ResumeWise AI Assistant", a highly specialized career, resume, and interview coach.
Your ONLY purpose is to help the user with resumes, careers, job searching, interview preparation, learning roadmaps, and technical concepts related to their career.

{context_str}

CRITICAL RULES:
1. If the user asks something completely unrelated to careers, resumes, tech, or jobs (e.g., recipes, movies, general trivia), you MUST reply politely: "I'm specialized in resumes, careers, interviews, learning roadmaps, and job preparation. How can I help you with your career today?"
2. Be concise, encouraging, and highly professional.
3. Use markdown for formatting (bullet points, bold text, code blocks if necessary).
4. If the user asks about their ATS score or skills, use the context provided above. Do not ask them to upload a resume if the context already shows they have one.

User Message: {message}
"""
        
        try:
            response = self.gemini_service.client.models.generate_content(
                model=self.gemini_service.model_name,
                contents=system_prompt
            )
            
            if not response or not response.text:
                raise ValueError("No response from Gemini")
                
            return response.text.strip()
            
        except Exception as e:
            current_app.logger.error(f"Error in ChatService.get_chat_response: {str(e)}")
            raise RuntimeError(f"Chat failed: {str(e)}")
