import os
import traceback
import resend


class EmailService:
    """Resend API Email Service for ResumeWise AI"""

    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY", "")
        if self.api_key:
            resend.api_key = self.api_key
        self.from_email = "ResumeWise <onboarding@resend.dev>"

    def send_email(self, recipient, subject, html_body):
        """
        Reusable email dispatcher using Resend Python SDK
        """
        if not self.api_key:
            print(
                f"[WARNING] RESEND_API_KEY missing in environment variables. Email to {recipient} simulated in console log.",
                flush=True
            )
            print("==========================================", flush=True)
            print("  [EMULATOR MODE - RESEND EMAIL DISPATCH]")
            print(f"  Recipient: {recipient}", flush=True)
            print(f"  Subject: {subject}", flush=True)
            print("==========================================\n", flush=True)
            return True

        try:
            print(f"[RESEND DISPATCH] Dispatching email to {recipient} with subject '{subject}'...", flush=True)
            
            params = {
                "from": self.from_email,
                "to": [recipient],
                "subject": subject,
                "html": html_body,
            }

            response = resend.Emails.send(params)
            
            print(f"[RESEND SUCCESS] Email sent successfully to {recipient}. Response: {response}", flush=True)
            return True

        except Exception as e:
            print(f"[RESEND ERROR] Failed to send email to {recipient} via Resend: {str(e)}", flush=True)
            traceback.print_exc()
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
            print("Template Name: resume_analysis.html", flush=True)
            print(f"Recipient: {to_email}", flush=True)
            print("Email Type: Resume Analysis Report", flush=True)

            templates_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "templates"
            )
            template_path = os.path.join(templates_dir, "resume_analysis.html")
            
            try:
                with open(template_path, "r", encoding="utf-8") as f:
                    html_content = f.read()
            except Exception as file_err:
                print(f"[ERROR] Failed to load resume_analysis.html template: {str(file_err)}", flush=True)
                raise file_err

            html_content = html_content \
                .replace("{{ user_name }}", name) \
                .replace("{{ target_role }}", target_role) \
                .replace("{{ ats_score }}", str(ats_score)) \
                .replace("{{ strengths }}", ", ".join(strengths) if isinstance(strengths, list) else str(strengths)) \
                .replace("{{ missing_skills }}", ", ".join(missing_skills) if isinstance(missing_skills, list) else str(missing_skills)) \
                .replace("{{ suggestions }}", ", ".join(suggestions) if isinstance(suggestions, list) else str(suggestions)) \
                .replace("{{ skill_coverage }}", str(skill_coverage))

            subject = f"ResumeWise AI - Resume Analysis Report for {name}"
            return self.send_email(to_email, subject, html_content)

        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Unexpected failure in send_analysis_email: {str(e)}", flush=True)
            return False

    def send_otp_email(self, recipient_email, otp_code, purpose):
        """
        Send a secure OTP email using Resend API and standalone templates/otp_email.html file.
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
            
            try:
                with open(template_path, "r", encoding="utf-8") as f:
                    html_content = f.read()
            except Exception as file_err:
                print(f"[ERROR] Failed to load otp_email.html template: {str(file_err)}", flush=True)
                raise file_err

            html_content = html_content \
                .replace("{{ user_name }}", user_name) \
                .replace("{{ otp }}", str(otp_code)) \
                .replace("{{ purpose_text }}", purpose_text) \
                .replace("{{ recipient_email }}", recipient_email)

            subject = f"ResumeWise AI - {purpose_text} Verification Code"
            return self.send_email(recipient_email, subject, html_content)

        except Exception as e:
            print("[EMAIL SERVICE ERROR] Unexpected failure in send_otp_email:", str(e), flush=True)
            return False