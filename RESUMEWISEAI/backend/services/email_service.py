import os
import smtplib
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


class EmailService:
    """Gmail SMTP Email Service for ResumeWise AI"""

    def __init__(self):
        # Load SMTP settings from environment or app config
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        
        # Safe type-casting of SMTP Port
        smtp_port_val = os.getenv("SMTP_PORT", "587")
        try:
            self.smtp_port = int(smtp_port_val)
        except ValueError:
            self.smtp_port = 587

        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASSWORD", "")

    def send_email(self, recipient, subject, html_body):
        """
        Reusable email dispatcher function using TLS SMTP
        """
        if not self.smtp_user or not self.smtp_pass:
            print(f"[WARNING] SMTP credentials missing in environment variables. Email to {recipient} simulated in console log.", flush=True)
            print(f"==========================================", flush=True)
            print(f"  [EMULATOR MODE - EMAIL DISPATCH]")
            print(f"  Recipient: {recipient}", flush=True)
            print(f"  Subject: {subject}", flush=True)
            print(f"==========================================\n", flush=True)
            return True

        try:
            print(f"[SMTP CONNECTION] Connecting to SMTP server {self.smtp_host}:{self.smtp_port}...", flush=True)
            
            # Initialize connection using standard SSL/TLS or StartTLS based on port
            if self.smtp_port == 465:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=20)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=20)
                print(f"[SMTP CONNECTION] Starting TLS handshake...", flush=True)
                server.starttls()

            print(f"[SMTP CONNECTION] Attempting login for user: {self.smtp_user}...", flush=True)
            server.login(self.smtp_user, self.smtp_pass)
            print(f"[SMTP LOGIN SUCCESS] Authenticated successfully.", flush=True)

            # Constructing email payload
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"ResumeWise AI <{self.smtp_user}>"
            msg["To"] = recipient

            part = MIMEText(html_body, "html")
            msg.attach(part)

            print(f"[SMTP DISPATCH] Dispatching email to {recipient} with subject '{subject}'...", flush=True)
            server.sendmail(self.smtp_user, recipient, msg.as_string())
            server.quit()
            print(f"[SMTP SUCCESS] Email sent successfully to {recipient}.", flush=True)
            return True

        except Exception as e:
            print(f"[SMTP ERROR] Failed to send email to {recipient} via SMTP: {str(e)}", flush=True)
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
            # DEBUG LOGS before rendering template
            print(f"Template Name: resume_analysis.html", flush=True)
            print(f"Recipient: {to_email}", flush=True)
            print(f"Email Type: Resume Analysis Report", flush=True)
            print(f"Variables:", flush=True)
            print(f"  user_name={name}", flush=True)
            print(f"  target_role={target_role}", flush=True)
            print(f"  ats_score={ats_score}", flush=True)
            print(f"  strengths={strengths}", flush=True)
            print(f"  missing_skills={missing_skills}", flush=True)
            print(f"  suggestions={suggestions}", flush=True)
            print(f"  skill_coverage={skill_coverage}", flush=True)

            # Load the standalone resume_analysis.html template
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

            # Render variables into the template HTML
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
        Send a secure OTP email using the standalone templates/otp_email.html file.
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

            # DEBUG LOGGING before rendering template
            print(f"Template Name: otp_email.html", flush=True)
            print(f"Recipient: {recipient_email}", flush=True)
            print(f"Email Type: {email_type}", flush=True)
            print(f"Variables:", flush=True)
            print(f"user_name={user_name}", flush=True)
            print(f"otp={otp_code}", flush=True)
            print(f"expiry_minutes=5", flush=True)

            # Load the standalone templates/otp_email.html template
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

            # Render variables into the standalone OTP template HTML
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