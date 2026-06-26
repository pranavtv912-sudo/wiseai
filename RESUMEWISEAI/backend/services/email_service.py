import os
import requests
from flask import current_app


class EmailService:
    """EmailJS Service for ResumeWise AI"""

    def __init__(self):
        self.service_id = os.getenv(
            "EMAILJS_SERVICE_ID",
            current_app.config.get("EMAILJS_SERVICE_ID", "")
        )

        self.template_id = os.getenv(
            "EMAILJS_TEMPLATE_ID",
            current_app.config.get("EMAILJS_TEMPLATE_ID", "")
        )

        self.public_key = os.getenv(
            "EMAILJS_PUBLIC_KEY",
            current_app.config.get("EMAILJS_PUBLIC_KEY", "")
        )

        self.private_key = os.getenv(
            "EMAILJS_PRIVATE_KEY",
            current_app.config.get("EMAILJS_PRIVATE_KEY", "")
        )

        self.endpoint = "https://api.emailjs.com/api/v1.0/email/send"

    def send_analysis_email(
        self,
        to_email,
        name,
        target_role,
        ats_score,
        strengths,
        missing_skills,
        suggestions,
        skill_coverage
    ):
        try:
            print("\n========== EMAILJS DEBUG ==========")
            print("SERVICE ID:", self.service_id)
            print("TEMPLATE ID:", self.template_id)
            print("PUBLIC KEY:", self.public_key)
            print("TO EMAIL:", to_email)
            print("===================================\n")

            if not self.service_id:
                raise Exception("EMAILJS_SERVICE_ID missing")

            if not self.template_id:
                raise Exception("EMAILJS_TEMPLATE_ID missing")

            if not self.public_key:
                raise Exception("EMAILJS_PUBLIC_KEY missing")

            if not self.private_key:
                raise Exception("EMAILJS_PRIVATE_KEY missing")

            print("\n========== EMAILJS DEBUG ==========")
            print("EMAILJS SERVICE:", self.service_id)
            print("EMAILJS TEMPLATE:", self.template_id)
            print("EMAILJS PUBLIC KEY:", self.public_key)
            print("EMAILJS PRIVATE KEY:", "***LOADED***")
            print("TO EMAIL:", to_email)
            print("===================================\n")

            payload = {
                "service_id": self.service_id,
                "template_id": self.template_id,
                "user_id": self.public_key,
                "accessToken": self.private_key,
                "template_params": {
                    "to_email": to_email,
                    "name": name,
                    "target_role": target_role,
                    "ats_score": str(ats_score),
                    "strengths": ", ".join(strengths)
                    if isinstance(strengths, list)
                    else str(strengths),
                    "missing_skills": ", ".join(missing_skills)
                    if isinstance(missing_skills, list)
                    else str(missing_skills),
                    "suggestions": ", ".join(suggestions)
                    if isinstance(suggestions, list)
                    else str(suggestions),
                    "skill_coverage": str(skill_coverage),
                },
            }

            headers = {
                "Content-Type": "application/json"
            }

            response = requests.post(
                self.endpoint,
                json=payload,
                headers=headers,
                timeout=20
            )

            print("\n========== EMAILJS RESPONSE ==========")
            print("STATUS CODE:", response.status_code)
            print("RESPONSE:", response.text)
            print("======================================\n")

            if response.status_code in [200, 202]:
                print("EMAIL SENT SUCCESSFULLY")
                return True

            print("EMAILJS ERROR STATUS:", response.status_code)
            print("EMAILJS ERROR BODY:", response.text)
            return False

        except Exception as e:
            print("\n========== EMAIL ERROR ==========")
            print(str(e))
            print("=================================\n")
            return False

    def send_email(self, recipient_email, template_params):
        try:
            if not self.service_id:
                raise Exception("EMAILJS_SERVICE_ID missing")

            if not self.template_id:
                raise Exception("EMAILJS_TEMPLATE_ID missing")

            if not self.public_key:
                raise Exception("EMAILJS_PUBLIC_KEY missing")

            if not self.private_key:
                raise Exception("EMAILJS_PRIVATE_KEY missing")

            print("\n========== EMAILJS DEBUG ==========")
            print("EMAILJS SERVICE:", self.service_id)
            print("EMAILJS TEMPLATE:", self.template_id)
            print("EMAILJS PUBLIC KEY:", self.public_key)
            print("EMAILJS PRIVATE KEY:", "***LOADED***")
            print("RECIPIENT EMAIL:", recipient_email)
            print("===================================\n")

            payload = {
                "service_id": self.service_id,
                "template_id": self.template_id,
                "user_id": self.public_key,
                "accessToken": self.private_key,
                "template_params": template_params,
            }

            response = requests.post(
                self.endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=20,
            )

            print("EMAIL STATUS:", response.status_code)
            print("EMAIL RESPONSE:", response.text)

            if response.status_code in [200, 202]:
                print("EMAIL SENT SUCCESSFULLY")
                return True

            print("EMAILJS ERROR STATUS:", response.status_code)
            print("EMAILJS ERROR BODY:", response.text)
            return False

        except Exception as e:
            print("EMAIL ERROR:", str(e))
            return False