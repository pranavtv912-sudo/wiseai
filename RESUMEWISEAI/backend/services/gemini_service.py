import requests
from google import genai
from typing import Dict, List
from flask import current_app
import json

class MockModels:
    def __init__(self, service):
        self.service = service
    def generate_content(self, model, contents):
        class MockResponse:
            def __init__(self, text):
                self.text = text
        text = self.service._generate_content(contents)
        return MockResponse(text)

class MockClient:
    def __init__(self, service):
        self.models = MockModels(service)

class GeminiAIService:
    """Service for AI-powered analysis using OpenRouter / Google Gemini"""
    
    def __init__(self):
        """Initialize Gemini/OpenRouter API"""
        self.openrouter_api_key = current_app.config.get('OPENROUTER_API_KEY', '')
        self.openrouter_model = current_app.config.get('OPENROUTER_MODEL', 'google/gemini-2.5-flash')
        
        self.client = None
        self.model_name = 'gemini-2.5-flash'
        
        if self.openrouter_api_key:
            # Route through OpenRouter mock client interceptor
            self.client = MockClient(self)
            self.model_name = self.openrouter_model
        else:
            api_key = current_app.config.get('GEMINI_API_KEY', '')
            if api_key:
                try:
                    self.client = genai.Client(api_key=api_key)
                except Exception as e:
                    print(f"Error initializing Gemini client: {e}")
            else:
                import os
                env_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
                if env_key:
                    try:
                        self.client = genai.Client(api_key=env_key)
                    except Exception as e:
                        print(f"Error initializing Gemini client with env key: {e}")
                else:
                    print("Gemini API key is not configured.")

    def _generate_content(self, prompt: str) -> str:
        """Helper to call OpenRouter API via HTTP requests"""
        try:
            headers = {
                "Authorization": f"Bearer {self.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "ResumeWise AI"
            }
            data = {
                "model": self.openrouter_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500
            }
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            if response.status_code == 200:
                res_json = response.json()
                return res_json['choices'][0]['message']['content']
            else:
                print(f"[ERROR] OpenRouter error status {response.status_code}: {response.text}")
                return ''
        except Exception as e:
            print(f"[ERROR] OpenRouter request failed: {e}")
            return ''
    
    def generate_resume_summary(self, resume_text: str, max_length: int = 500) -> str:
        """
        Generate professional summary of resume
        
        Args:
            resume_text: Raw resume text
            max_length: Maximum length of summary
            
        Returns:
            AI-generated resume summary
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return ''
        try:
            prompt = f"""Based on the following resume, write a professional summary (max {max_length} words) that highlights key strengths and experience:

{resume_text[:2000]}

Write a concise, impactful professional summary."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text if response else ''
        
        except Exception as e:
            print(f'Error generating summary: {str(e)}')
            return ''
    
    def generate_strengths(self, resume_data: Dict) -> List[str]:
        """
        Generate list of resume strengths
        
        Args:
            resume_data: Extracted resume data
            
        Returns:
            List of identified strengths
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return []
        try:
            skills = ', '.join(resume_data.get('skills', [])[:10])
            projects = ', '.join([p.get('name', '') for p in resume_data.get('projects', [])[:3]])
            certifications = ', '.join(resume_data.get('certifications', [])[:5])
            
            prompt = f"""Based on the following resume components, identify 5-7 key strengths:

Skills: {skills}
Projects: {projects}
Certifications: {certifications}

Return as a JSON array of strings with strengths."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            # Parse response as JSON array
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                strengths = json.loads(json_match.group())
                return strengths
            
            return []
        
        except Exception as e:
            print(f'Error generating strengths: {str(e)}')
            return []
    
    def generate_weaknesses(self, resume_data: Dict, target_role: str) -> List[str]:
        """
        Generate list of improvement areas
        
        Args:
            resume_data: Extracted resume data
            target_role: Target job role
            
        Returns:
            List of areas for improvement
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return []
        try:
            skills = ', '.join(resume_data.get('skills', [])[:10])
            experience = len(resume_data.get('experience', []))
            education = len(resume_data.get('education', []))
            
            prompt = f"""For a candidate applying as a {target_role}, identify 5-7 areas for improvement based on:

Current Skills: {skills}
Years of Experience: {experience}
Education Level: {education}

Return as a JSON array of strings with areas for improvement."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                weaknesses = json.loads(json_match.group())
                return weaknesses
            
            return []
        
        except Exception as e:
            print(f'Error generating weaknesses: {str(e)}')
            return []
    
    def generate_improvement_suggestions(self, resume_data: Dict, ats_score: float) -> List[str]:
        """
        Generate actionable improvement suggestions
        
        Args:
            resume_data: Extracted resume data
            ats_score: Current ATS score
            
        Returns:
            List of improvement suggestions
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return []
        try:
            missing_sections = []
            if not resume_data.get('projects'):
                missing_sections.append('Projects')
            if not resume_data.get('certifications'):
                missing_sections.append('Certifications')
            if not resume_data.get('education'):
                missing_sections.append('Education')
            
            prompt = f"""Based on ATS score of {ats_score}/100 and missing sections {missing_sections}, 
provide 7-10 specific, actionable improvements to boost the resume's ATS score and professional appeal.

Return as a JSON array of strings with improvement suggestions."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                suggestions = json.loads(json_match.group())
                return suggestions
            
            return []
        
        except Exception as e:
            print(f'Error generating suggestions: {str(e)}')
            return []
    
    def generate_career_guidance(self, resume_data: Dict, target_role: str = None) -> str:
        """
        Generate personalized career guidance
        
        Args:
            resume_data: Extracted resume data
            target_role: Target career role
            
        Returns:
            Career guidance text
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return ''
        try:
            skills = ', '.join(resume_data.get('skills', [])[:10])
            experience_count = len(resume_data.get('experience', []))
            
            prompt = f"""Based on the candidate's profile:
- Skills: {skills}
- Years of Experience: {experience_count}
- Target Role: {target_role or 'Not specified'}

Provide detailed career guidance including:
1. Current career trajectory assessment
2. Best next steps for career growth
3. Industries best suited for this profile
4. Long-term career recommendations

Keep it practical and actionable."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text if response else ''
        
        except Exception as e:
            print(f'Error generating career guidance: {str(e)}')
            return ''
    
    def generate_interview_questions(self, skills: List[str], target_role: str, count: int = 10) -> List[str]:
        """
        Generate interview questions for target role
        
        Args:
            skills: Candidate's skills
            target_role: Target job role
            count: Number of questions to generate
            
        Returns:
            List of interview questions
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return []
        try:
            skills_str = ', '.join(skills[:8])
            
            prompt = f"""Generate {count} realistic interview questions for a {target_role} position with skills in: {skills_str}

Include:
- 3 technical questions
- 3 behavioral questions
- 2 situational questions
- 2 role-specific questions

Return as a JSON array of strings with questions."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
                return questions
            
            return []
        
        except Exception as e:
            print(f'Error generating interview questions: {str(e)}')
            return []
 
    def generate_skill_notes(self, skill_name: str, note_count: int = 5) -> List[str]:
        """
        Generate AI-powered learning notes for a skill.
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return []
        try:
            prompt = f"""Create {note_count} concise AI learning notes for the skill '{skill_name}'.

Each note should be practical, easy to read, and focus on key concepts, common tools, or best practices.

Return the result as a JSON array of strings."""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                notes = json.loads(json_match.group())
                return notes
            return [line.strip() for line in response.text.split('\n') if line.strip()][:note_count]
        except Exception as e:
            print(f'Error generating skill notes: {str(e)}')
            return []
 
    def generate_career_roadmap(self, current_skills: List[str], goal_role: str, months: int = 12) -> Dict:
        """
        Generate career roadmap for skill development
        
        Args:
            current_skills: Current skills
            goal_role: Target career role
            months: Duration of roadmap (default 12 months)
            
        Returns:
            Dictionary with monthly roadmap
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return self._generate_default_roadmap(goal_role, months)
        try:
            skills_str = ', '.join(current_skills[:8])
            
            prompt = f"""Create a {months}-month career development roadmap for someone with {skills_str} skills 
who wants to become a {goal_role}.

For each month, provide:
1. Key skill to focus on
2. Learning resources/courses (max 2-3)
3. Practical project idea
4. Milestone/achievement

Return as JSON object with months as keys and objects as values."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            # Parse response as JSON
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                roadmap = json.loads(json_match.group())
                return roadmap
            
            return self._generate_default_roadmap(goal_role, months)
        
        except Exception as e:
            print(f'Error generating roadmap: {str(e)}')
            return self._generate_default_roadmap(goal_role, months)
    
    def _generate_default_roadmap(self, goal_role: str, months: int) -> Dict:
        """Generate default roadmap if AI generation fails"""
        roadmap = {}
        for i in range(1, months + 1):
            roadmap[f'month_{i}'] = {
                'focus': f'Phase {(i-1)//3 + 1} Learning',
                'resources': ['Udemy', 'Coursera'],
                'project': f'Build project {i}',
                'milestone': f'Complete {goal_role} skill #{i}'
            }
        return roadmap
    
    def generate_cover_letter(self, resume_data: Dict, job_description: str, company: str) -> str:
        """
        Generate personalized cover letter
        
        Args:
            resume_data: Extracted resume data
            job_description: Job description text
            company: Company name
            
        Returns:
            Generated cover letter
        """
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return ''
        try:
            skills = ', '.join(resume_data.get('skills', [])[:8])
            experience_summary = ' '.join([e.get('title', '') for e in resume_data.get('experience', [])[:2]])
            
            prompt = f"""Write a compelling cover letter for:
Company: {company}
Job Description: {job_description[:500]}

Candidate Background:
- Top Skills: {skills}
- Experience: {experience_summary}

Make it personalized, professional, and achievement-focused. Keep to 3-4 paragraphs."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text if response else ''
        
        except Exception as e:
            print(f'Error generating cover letter: {str(e)}')
            return ''

    def extract_skills_from_jd(self, job_description: str) -> Dict:
        """
        Extract required and preferred skills from a job description text using Gemini AI.
        
        Returns:
            Dict: {'required': List[str], 'preferred': List[str], 'role_name': str}
        """
        default_res = {
            'required': [],
            'preferred': [],
            'role_name': 'Software Developer'
        }
        if not self.client:
            print("Gemini client is not initialized (missing API key).")
            return default_res
        try:
            prompt = f"""Analyze the following Job Description text and extract:
1. "required": A JSON list of core required technical and soft skills, frameworks, programming languages, and tools.
2. "preferred": A JSON list of preferred/nice-to-have/bonus skills, tools, or qualifications.
3. "role_name": An estimated suitable job title/role name for this position.

Job Description:
{job_description[:3000]}

Return the output ONLY as a JSON object with keys "required", "preferred", and "role_name". Do not include markdown code block formatting or any other text.
Example format:
{{
  "required": ["Python", "Flask", "SQL"],
  "preferred": ["Docker", "Kubernetes", "AWS"],
  "role_name": "Backend Engineer"
}}"""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                extracted = json.loads(json_match.group())
                return {
                    'required': extracted.get('required', []),
                    'preferred': extracted.get('preferred', []),
                    'role_name': extracted.get('role_name', 'Software Developer')
                }
            
            return default_res
        except Exception as e:
            print(f'Error extracting skills from Job Description: {str(e)}')
            return default_res

    def evaluate_interview_answer(self, question: str, answer: str, mode: str) -> Dict:
        """
        Evaluate candidate response to an interview question.
        """
        default_res = {
            "correctness": "Partially Correct",
            "technicalAccuracy": "Medium",
            "completeness": "Needs Elaboration",
            "confidenceScore": 70,
            "missingConcepts": [],
            "suggestedBetterAnswer": "A proper answer involves explaining the concepts clearly.",
            "finalScore": 70
        }
        if not self.client:
            return default_res
            
        try:
            prompt = f"""You are an expert AI Interview Evaluator.
Perform evaluation on the following candidate response:
- Question: "{question}"
- Answer: "{answer}"
- Mode: "{mode}"

You must output a single JSON object containing these keys:
"correctness": a short string explaining how correct the answer is (e.g. "Fully Correct", "Partially Correct", "Incorrect").
"technicalAccuracy": a short string grading the technical accuracy (e.g. "High", "Medium", "Low", "None").
"completeness": a short string grading completeness (e.g. "Complete", "Needs Elaboration", "Incomplete").
"confidenceScore": an integer number (0-100) representing the candidate's confidence level based on their phrasing.
"missingConcepts": a JSON array of strings representing concepts that were missing from the candidate's answer.
"suggestedBetterAnswer": a paragraph offering a suggested better answer.
"finalScore": an integer score (0-100) based on correctness and completeness.

Evaluation criteria:
- If the answer is incorrect, wrong, or weak: the finalScore must be low (less than 40), correctness must be "Incorrect", and the suggestedBetterAnswer must offer constructive feedback.
- If the answer is correct: give positive reinforcement and a high score (80-100).
- The suggested better answer must be highly relevant and accurate.

Return the output ONLY as a JSON object. Do not include markdown formatting or any other text."""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                evaluation = json.loads(json_match.group())
                return evaluation
                
            return default_res
        except Exception as e:
            print(f'Error evaluating answer: {str(e)}')
            return default_res


