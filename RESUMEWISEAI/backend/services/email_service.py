import os
import requests


class EmailService:
    """EmailJS REST API Email Service for ResumeWise AI"""

    EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send"

    def __init__(self):
        self.service_id = os.getenv("EMAILJS_SERVICE_ID", "").strip()
        self.template_id = os.getenv("EMAILJS_TEMPLATE_ID", "").strip()
        self.public_key = os.getenv("EMAILJS_PUBLIC_KEY", "").strip()

        # EmailJS Private Key
        # Keep this ONLY on the backend/Railway.
        self.private_key = os.getenv("EMAILJS_PRIVATE_KEY", "").strip()

        self.analysis_template_id = os.getenv(
            "EMAILJS_ANALYSIS_TEMPLATE_ID",
            ""
        ).strip()

    # ============================================================
    # GENERIC EMAILJS SENDER
    # ============================================================

    def send_email(
        self,
        recipient,
        subject,
        template_params=None,
        html_body=None,
        override_template_id=None
    ):
        """
        Send an email using EmailJS REST API.
        """

        target_template_id = (
            override_template_id or self.template_id
        ).strip()

        # --------------------------------------------------------
        # Validate configuration
        # --------------------------------------------------------

        if not self.service_id:
            print(
                "[EMAILJS ERROR] EMAILJS_SERVICE_ID is missing",
                flush=True
            )
            return False

        if not target_template_id:
            print(
                "[EMAILJS ERROR] EMAILJS_TEMPLATE_ID is missing",
                flush=True
            )
            return False

        if not self.public_key:
            print(
                "[EMAILJS ERROR] EMAILJS_PUBLIC_KEY is missing",
                flush=True
            )
            return False

        if template_params is None:
            template_params = {}

        # --------------------------------------------------------
        # Default template parameters
        # --------------------------------------------------------

        template_params.setdefault(
            "name",
            recipient.split("@")[0]
        )

        template_params.setdefault(
            "email",
            recipient
        )

        template_params.setdefault(
            "recipient_email",
            recipient
        )

        template_params.setdefault(
            "to_email",
            recipient
        )

        template_params.setdefault(
            "subject",
            subject
        )

        # --------------------------------------------------------
        # EmailJS payload
        # --------------------------------------------------------

        payload = {
            "service_id": self.service_id,
            "template_id": target_template_id,
            "user_id": self.public_key,
            "template_params": template_params
        }

        # IMPORTANT:
        # EmailJS REST API supports accessToken using
        # the account Private Key.
        #
        # This key must remain on the backend only.
        if self.private_key:
            payload["accessToken"] = self.private_key

        # --------------------------------------------------------
        # Send request
        # --------------------------------------------------------

        try:

            print(
                f"[EMAILJS DISPATCH] "
                f"Service: {self.service_id} | "
                f"Template: {target_template_id} | "
                f"Recipient: {recipient}",
                flush=True
            )

            response = requests.post(
                self.EMAILJS_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json"
                },
                timeout=15
            )

            response_text = (
                response.text or ""
            ).strip()

            # ----------------------------------------------------
            # SUCCESS
            # ----------------------------------------------------

            if response.status_code == 200:

                print(
                    "[EMAILJS SUCCESS] Email accepted by EmailJS",
                    flush=True
                )

                return True

            # ----------------------------------------------------
            # FAILURE
            # ----------------------------------------------------

            print(
                f"[EMAILJS ERROR] "
                f"HTTP {response.status_code} | "
                f"Response: {response_text[:1000]}",
                flush=True
            )

            return False

        # --------------------------------------------------------
        # Timeout
        # --------------------------------------------------------

        except requests.exceptions.Timeout:

            print(
                "[EMAILJS ERROR] EmailJS request timed out",
                flush=True
            )

            return False

        # --------------------------------------------------------
        # Network error
        # --------------------------------------------------------

        except requests.exceptions.RequestException as e:

            print(
                f"[EMAILJS ERROR] "
                f"Network error: {type(e).__name__}",
                flush=True
            )

            return False

        # --------------------------------------------------------
        # Unexpected error
        # --------------------------------------------------------

        except Exception as e:

            print(
                f"[EMAILJS ERROR] "
                f"Unexpected error: {type(e).__name__}",
                flush=True
            )

            return False

    # ============================================================
    # OTP EMAIL
    # ============================================================

    def send_otp_email(
        self,
        recipient_email,
        otp_code,
        purpose
    ):
        """
        Send OTP verification email through EmailJS.
        """

        try:

            # ----------------------------------------------------
            # Determine purpose
            # ----------------------------------------------------

            if purpose == "register":

                purpose_text = "Account Registration"

            elif purpose == "forgot_password":

                purpose_text = "Password Recovery"

            elif purpose == "change_password":

                purpose_text = "Password Reset Verification"

            else:

                purpose_text = "Verification"

            # ----------------------------------------------------
            # User information
            # ----------------------------------------------------

            user_name = recipient_email.split("@")[0]

            subject = (
                f"ResumeWise AI - "
                f"{purpose_text} Verification Code"
            )

            print(
                "Template Name: otp_email.html",
                flush=True
            )

            print(
                f"Recipient: {recipient_email}",
                flush=True
            )

            print(
                f"Email Type: {purpose_text}",
                flush=True
            )

            # ----------------------------------------------------
            # IMPORTANT
            #
            # EmailJS already stores the HTML template.
            # We don't need to load otp_email.html here.
            # ----------------------------------------------------

            template_params = {

                "purpose_text": purpose_text,

                "user_name": user_name,

                "otp": str(otp_code),

                "recipient_email": recipient_email,

                "name": user_name,

                "email": recipient_email,

                "to_email": recipient_email,

                "purpose": purpose_text,

                "time": "5 minutes",

                "subject": subject
            }

            # ----------------------------------------------------
            # Send OTP
            # ----------------------------------------------------

            return self.send_email(
                recipient_email,
                subject,
                template_params=template_params
            )

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"OTP failure: {type(e).__name__}",
                flush=True
            )

            return False

    # ============================================================
    # RESUME ANALYSIS EMAIL
    # ============================================================

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
        """
        Send resume analysis email through EmailJS.
        """

        try:

            # ----------------------------------------------------
            # Determine template
            # ----------------------------------------------------

            target_template = (
                self.analysis_template_id
                or self.template_id
            )

            if not target_template:

                print(
                    "[EMAILJS ERROR] "
                    "No analysis template configured",
                    flush=True
                )

                return False

            # ----------------------------------------------------
            # Subject
            # ----------------------------------------------------

            subject = (
                f"ResumeWise AI - "
                f"Resume Analysis Report for {name}"
            )

            # ----------------------------------------------------
            # Convert lists to strings
            # ----------------------------------------------------

            strengths_text = (
                ", ".join(strengths)
                if isinstance(strengths, list)
                else str(strengths)
            )

            missing_skills_text = (
                ", ".join(missing_skills)
                if isinstance(missing_skills, list)
                else str(missing_skills)
            )

            suggestions_text = (
                ", ".join(suggestions)
                if isinstance(suggestions, list)
                else str(suggestions)
            )

            # ----------------------------------------------------
            # EmailJS template parameters
            # ----------------------------------------------------

            template_params = {

                "name": name,

                "user_name": name,

                "email": to_email,

                "recipient_email": to_email,

                "to_email": to_email,

                "target_role": target_role,

                "ats_score": str(ats_score),

                "strengths": strengths_text,

                "missing_skills": missing_skills_text,

                "suggestions": suggestions_text,

                "skill_coverage": str(skill_coverage),

                "subject": subject
            }

            # ----------------------------------------------------
            # Send analysis email
            # ----------------------------------------------------

            return self.send_email(
                to_email,
                subject,
                template_params=template_params,
                override_template_id=target_template
            )

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"Analysis email failure: {type(e).__name__}",
                flush=True
            )

            return False