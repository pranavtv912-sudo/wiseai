import os
import requests


class EmailService:
    """EmailJS REST API Email Service for ResumeWise AI"""

    def __init__(self):
        self.service_id = os.getenv("EMAILJS_SERVICE_ID", "")
        self.template_id = os.getenv("EMAILJS_TEMPLATE_ID", "")
        self.public_key = os.getenv("EMAILJS_PUBLIC_KEY", "")
        self.analysis_template_id = os.getenv("EMAILJS_ANALYSIS_TEMPLATE_ID", "")

    def send_email(self, recipient, subject, template_params=None, html_body=None, override_template_id=None):
        """
        Reusable email dispatcher using EmailJS REST API.
        Accepts template_params dict and optional html_body for backwards compatibility.
        """
        target_template_id = override_template_id or self.template_id

        if not self.service_id or not target_template_id or not self.public_key:
            print(
                "[EMAILJS ERROR] Missing EmailJS configuration (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, or EMAILJS_PUBLIC_KEY). Email sending aborted.",
                flush=True
            )
            return False

        if template_params is None:
            template_params = {}

        if "name" not in template_params:
            template_params["name"] = recipient.split("@")[0]
        if "email" not in template_params:
            template_params["email"] = recipient
        if "recipient_email" not in template_params:
            template_params["recipient_email"] = recipient
        if "to_email" not in template_params:
            template_params["to_email"] = recipient
        if "subject" not in template_params:
            template_params["subject"] = subject

        if html_body and "html_content" not in template_params:
            template_params["html_content"] = html_body

        payload = {
            "service_id": self.service_id,
            "template_id": target_template_id,
            "user_id": self.public_key,
            "template_params": template_params
        }

        try:
            print(f"[EMAILJS DISPATCH] Dispatching email to {recipient} with subject '{subject}'...", flush=True)
            
            response = requests.post(
                "https://api.emailjs.com/api/v1.0/email/send",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=20
            )

            if response.status_code == 200:
                print(f"[EMAILJS SUCCESS] Email request accepted for recipient", flush=True)
                return True
            else:
                print(
                    f"[EMAILJS ERROR] Failed to send email. Status: {response.status_code}",
                    flush=True
                )
                return False

        except requests.exceptions.Timeout:
            print(f"[EMAILJS ERROR] Connection timed out while sending email", flush=True)
            return False
        except requests.exceptions.RequestException as e:
            print(f"[EMAILJS ERROR] Network error sending email: {type(e).__name__}", flush=True)
            return False
        except Exception as e:
            print(f"[EMAILJS ERROR] Unexpected error sending email: {type(e).__name__}", flush=True)
            return False

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
            target_template = self.analysis_template_id or self.template_id
            if not target_template:
                print("[EMAILJS NOTICE] OTP email system is ready, but a separate EmailJS template for resume analysis is not configured.", flush=True)
                return False

            print("Template Name: resume_analysis.html", flush=True)
            print(f"Recipient: {to_email}", flush=True)
            print("Email Type: Resume Analysis Report", flush=True)

            templates_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "templates"
            )
            template_path = os.path.join(templates_dir, "resume_analysis.html")
            
            html_content = ""
            try:
                with open(template_path, "r", encoding="utf-8") as f:
                    html_content = f.read()
                
                html_content = html_content \
                    .replace("{{ user_name }}", name) \
                    .replace("{{ target_role }}", target_role) \
                    .replace("{{ ats_score }}", str(ats_score)) \
                    .replace("{{ strengths }}", ", ".join(strengths) if isinstance(strengths, list) else str(strengths)) \
                    .replace("{{ missing_skills }}", ", ".join(missing_skills) if isinstance(missing_skills, list) else str(missing_skills)) \
                    .replace("{{ suggestions }}", ", ".join(suggestions) if isinstance(suggestions, list) else str(suggestions)) \
                    .replace("{{ skill_coverage }}", str(skill_coverage))
            except Exception as file_err:
                print(f"[WARNING] Failed to load resume_analysis.html template: {str(file_err)}", flush=True)

            subject = f"ResumeWise AI - Resume Analysis Report for {name}"
            
            template_params = {
                "name": name,
                "user_name": name,
                "email": to_email,
                "target_role": target_role,
                "ats_score": str(ats_score),
                "strengths": ", ".join(strengths) if isinstance(strengths, list) else str(strengths),
                "missing_skills": ", ".join(missing_skills) if isinstance(missing_skills, list) else str(missing_skills),
                "suggestions": ", ".join(suggestions) if isinstance(suggestions, list) else str(suggestions),
                "skill_coverage": str(skill_coverage),
                "recipient_email": to_email,
                "to_email": to_email,
                "subject": subject
            }

            return self.send_email(
                to_email,
                subject,
                template_params=template_params,
                html_body=html_content,
                override_template_id=self.analysis_template_id or None
            )

        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Unexpected failure in send_analysis_email: {type(e).__name__}", flush=True)
            return False

    def send_otp_email(self, recipient_email, otp_code, purpose):
        """
        Send a secure OTP email using EmailJS REST API.
        """
        try:
            email_type = "OTP Verification"
            purpose_text = "Verification"
            if purpose == "register":
                purpose_text = "Account Registration"
                email_type = "Registration OTP"
            elif purpose == "forgot_password":
                purpose_text = "Password Recovery"
                email_type = "Forgot Password OTP"
            elif purpose == "change_password":
                purpose_text = "Password Reset Verification"
                email_type = "Change Password OTP"

            user_name = recipient_email.split('@')[0]

            print("Template Name: otp_email.html", flush=True)
            print(f"Recipient: {recipient_email}", flush=True)
            print(f"Email Type: {email_type}", flush=True)

            templates_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "templates"
            )
            template_path = os.path.join(templates_dir, "otp_email.html")
            
            html_content = ""
            try:
                with open(template_path, "r", encoding="utf-8") as f:
                    html_content = f.read()

                html_content = html_content \
                    .replace("{{ user_name }}", user_name) \
                    .replace("{{ otp }}", str(otp_code)) \
                    .replace("{{ purpose_text }}", purpose_text) \
                    .replace("{{ recipient_email }}", recipient_email)
            except Exception as file_err:
                print(f"[WARNING] Failed to load otp_email.html template: {str(file_err)}", flush=True)

            subject = f"ResumeWise AI - {purpose_text} Verification Code"

            template_params = {
                "name": user_name,
                "user_name": user_name,
                "email": recipient_email,
                "recipient_email": recipient_email,
                "to_email": recipient_email,
                "otp": str(otp_code),
                "purpose": purpose_text,
                "purpose_text": purpose_text,
                "time": "5 minutes",
                "subject": subject
            }

            return self.send_email(recipient_email, subject, template_params=template_params, html_body=html_content)

        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Unexpected failure in send_otp_email: {type(e).__name__}", flush=True)
            return False