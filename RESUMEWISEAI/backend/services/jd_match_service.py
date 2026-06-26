"""
Service for matching Resumes against Job Descriptions using Gemini
"""
import json
import re
from typing import Dict, Any
from flask import current_app
from services.gemini_service import GeminiAIService
from models.Resume import Resume, Analysis

class JDMatchService:
    def __init__(self):
        self.gemini_service = GeminiAIService()

    def analyze_match(self, resume_id: str, job_description: str) -> Dict[str, Any]:
        """
        Compares a parsed resume against a job description using Gemini AI.
        Returns a structured dictionary with scores and feedback.
        """
        # Fetch the resume and its analysis
        resume = Resume.query.get(resume_id)
        if not resume:
            raise ValueError(f"Resume with ID {resume_id} not found.")

        # Gather existing parsed data
        skills = resume.extracted_skills or []
        experience = resume.extracted_experience or []
        education = resume.extracted_education or []
        projects = resume.extracted_projects or []
        
        # If there's no extracted data, fallback to raw text if available
        resume_content = ""
        if skills or experience or education:
            resume_content = f"Skills: {', '.join(skills)}\n\n"
            resume_content += "Experience:\n" + "\n".join([str(e) for e in experience]) + "\n\n"
            resume_content += "Education:\n" + "\n".join([str(e) for e in education]) + "\n\n"
            resume_content += "Projects:\n" + "\n".join([str(p) for p in projects])
        else:
            resume_content = resume.extracted_text or "No content available."

        if not self.gemini_service.client:
            raise RuntimeError("Gemini client is not initialized (missing API key).")

        prompt = f"""
You are an expert ATS (Applicant Tracking System) and senior recruiter.
Analyze how well the following Resume matches the given Job Description.

JOB DESCRIPTION:
{job_description[:3000]}

RESUME CONTENT:
{resume_content[:3000]}

Compare the two and provide a detailed analysis. You must return your response STRICTLY as a valid JSON object with the following exact keys and types:
{{
  "matchScore": <integer 0-100 representing overall match>,
  "keywordCoverage": <integer 0-100 representing keyword overlap>,
  "experienceMatch": <integer 0-100 representing experience alignment>,
  "educationMatch": <integer 0-100 representing education alignment>,
  "matchingSkills": [<array of strings representing skills in both JD and resume>],
  "missingSkills": [<array of strings representing skills in JD but missing from resume>],
  "strengths": [<array of strings representing strong alignment areas>],
  "weaknesses": [<array of strings representing weak alignment areas>],
  "suggestions": [<array of strings representing actionable improvement tips>]
}}

Ensure the response is valid, parseable JSON without any markdown formatting wrappers (no ```json or ```).
"""
        
        try:
            response = self.gemini_service.client.models.generate_content(
                model=self.gemini_service.model_name,
                contents=prompt
            )
            
            if not response or not response.text:
                raise ValueError("No response from Gemini")
                
            text_response = response.text
            
            # Clean up markdown formatting if the model still includes it
            text_response = re.sub(r'```json', '', text_response)
            text_response = re.sub(r'```', '', text_response)
            text_response = text_response.strip()
            
            # Parse the JSON
            result = json.loads(text_response)
            
            # Ensure required keys exist to prevent frontend errors
            default_keys = {
                "matchScore": 0,
                "keywordCoverage": 0,
                "experienceMatch": 0,
                "educationMatch": 0,
                "matchingSkills": [],
                "missingSkills": [],
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            }
            
            for key, default_val in default_keys.items():
                if key not in result:
                    result[key] = default_val
                    
            return result

        except json.JSONDecodeError as e:
            current_app.logger.error(f"Failed to parse Gemini response as JSON: {text_response}")
            raise ValueError("AI produced invalid JSON output. Please try again.")
        except Exception as e:
            current_app.logger.error(f"Error in analyze_match: {str(e)}")
            raise RuntimeError(f"Analysis failed: {str(e)}")
