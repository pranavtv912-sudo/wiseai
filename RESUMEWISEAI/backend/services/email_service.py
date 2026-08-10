import os
import requests


class EmailService:
    """
    EmailJS REST API Email Service for ResumeWise AI.

    Used for:
    1. Registration OTP
    2. Forgot Password OTP
    3. Change Password OTP
    4. Resume Analysis Email
    """

    EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send"

    def __init__(self):

        # =========================================================
        # EMAILJS CONFIGURATION
        # =========================================================

        self.service_id = os.getenv(
            "EMAILJS_SERVICE_ID", ""
        ).strip()

        self.template_id = os.getenv(
            "EMAILJS_TEMPLATE_ID", ""
        ).strip()

        self.public_key = os.getenv(
            "EMAILJS_PUBLIC_KEY", ""
        ).strip()

        self.private_key = os.getenv(
            "EMAILJS_PRIVATE_KEY", ""
        ).strip()

        self.analysis_template_id = os.getenv(
            "EMAILJS_ANALYSIS_TEMPLATE_ID", ""
        ).strip()

    # =============================================================
    # CONFIGURATION CHECK
    # =============================================================

    def _check_configuration(self, template_id):

        print(
            "========== EMAILJS CONFIGURATION ==========",
            flush=True
        )

        print(
            f"Service ID configured: {bool(self.service_id)}",
            flush=True
        )

        print(
            f"Template ID configured: {bool(template_id)}",
            flush=True
        )

        print(
            f"Public Key configured: {bool(self.public_key)}",
            flush=True
        )

        print(
            f"Private Key configured: {bool(self.private_key)}",
            flush=True
        )

        print(
            f"Service ID: {self.service_id}",
            flush=True
        )

        print(
            f"Template ID: {template_id}",
            flush=True
        )

        print(
            "===========================================",
            flush=True
        )

        if not self.service_id:
            print(
                "[EMAILJS ERROR] EMAILJS_SERVICE_ID is missing.",
                flush=True
            )
            return False

        if not template_id:
            print(
                "[EMAILJS ERROR] EMAILJS_TEMPLATE_ID is missing.",
                flush=True
            )
            return False

        if not self.public_key:
            print(
                "[EMAILJS ERROR] EMAILJS_PUBLIC_KEY is missing.",
                flush=True
            )
            return False

        return True

    # =============================================================
    # GENERIC EMAIL SENDER
    # =============================================================

    def send_email(
        self,
        recipient,
        subject,
        template_params=None,
        html_body=None,
        override_template_id=None
    ):

        target_template_id = (
            override_template_id or self.template_id
        ).strip()

        # ---------------------------------------------------------
        # Check configuration
        # ---------------------------------------------------------

        if not self._check_configuration(
            target_template_id
        ):
            return False

        # ---------------------------------------------------------
        # Template parameters
        # ---------------------------------------------------------

        if template_params is None:
            template_params = {}

        template_params = dict(template_params)

        template_params.setdefault(
            "name",
            recipient.split("@")[0]
        )

        template_params.setdefault(
            "user_name",
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

        if html_body:
            template_params.setdefault(
                "html_content",
                html_body
            )

        # =========================================================
        # EMAILJS PAYLOAD
        # =========================================================

        payload = {
            "service_id": self.service_id,
            "template_id": target_template_id,
            "user_id": self.public_key,
            "template_params": template_params
        }

        # IMPORTANT:
        # EmailJS REST API supports accessToken as the
        # account private key.
        #
        # Do NOT print the private key.

        if self.private_key:
            payload["accessToken"] = self.private_key

        # =========================================================
        # SEND REQUEST
        # =========================================================

        try:

            print(
                "-------------------------------------------",
                flush=True
            )

            print(
                "[EMAILJS DISPATCH] Sending email...",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] Service: {self.service_id}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] Template: "
                f"{target_template_id}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] Recipient: "
                f"{recipient}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] Subject: {subject}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] Private key included: "
                f"{bool(self.private_key)}",
                flush=True
            )

            response = requests.post(
                self.EMAILJS_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json"
                },
                timeout=20
            )

            response_text = (
                response.text or ""
            ).strip()

            print(
                f"[EMAILJS RESPONSE] HTTP "
                f"{response.status_code}",
                flush=True
            )

            print(
                f"[EMAILJS RESPONSE] "
                f"{response_text[:2000]}",
                flush=True
            )

            # -----------------------------------------------------
            # SUCCESS
            # -----------------------------------------------------

            if response.status_code == 200:

                print(
                    "[EMAILJS SUCCESS] "
                    "Email accepted by EmailJS.",
                    flush=True
                )

                print(
                    "-------------------------------------------",
                    flush=True
                )

                return True

            # -----------------------------------------------------
            # FAILURE
            # -----------------------------------------------------

            print(
                "[EMAILJS ERROR] EmailJS returned HTTP "
                f"{response.status_code}.",
                flush=True
            )

            print(
                f"[EMAILJS ERROR] Response: "
                f"{response_text[:2000]}",
                flush=True
            )

            print(
                "-------------------------------------------",
                flush=True
            )

            return False

        except requests.exceptions.Timeout:

            print(
                "[EMAILJS ERROR] EmailJS request timed out.",
                flush=True
            )

            return False

        except requests.exceptions.RequestException as e:

            print(
                "[EMAILJS ERROR] Network error: "
                f"{type(e).__name__}",
                flush=True
            )

            print(
                f"[EMAILJS ERROR] Details: {str(e)}",
                flush=True
            )

            return False

        except Exception as e:

            print(
                "[EMAILJS ERROR] Unexpected error: "
                f"{type(e).__name__}",
                flush=True
            )

            print(
                f"[EMAILJS ERROR] Details: {str(e)}",
                flush=True
            )

            return False

    # =============================================================
    # OTP EMAIL
    # =============================================================

    def send_otp_email(
        self,
        recipient_email,
        otp_code,
        purpose
    ):

        try:

            # -----------------------------------------------------
            # Determine purpose
            # -----------------------------------------------------

            if purpose == "register":

                purpose_text = "Account Registration"

            elif purpose == "forgot_password":

                purpose_text = "Password Recovery"

            elif purpose == "change_password":

                purpose_text = (
                    "Password Reset Verification"
                )

            else:

                purpose_text = "Verification"

            # -----------------------------------------------------
            # User name
            # -----------------------------------------------------

            user_name = (
                recipient_email.split("@")[0]
            )

            # -----------------------------------------------------
            # Subject
            # -----------------------------------------------------

            subject = (
                "ResumeWise AI - "
                f"{purpose_text} Verification Code"
            )

            # -----------------------------------------------------
            # Logging
            # -----------------------------------------------------

            print(
                "===========================================",
                flush=True
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

            print(
                f"OTP: {otp_code}",
                flush=True
            )

            print(
                "===========================================",
                flush=True
            )

            # =====================================================
            # EMAILJS TEMPLATE PARAMETERS
            # =====================================================

            template_params = {

                "purpose_text":
                    purpose_text,

                "user_name":
                    user_name,

                "otp":
                    str(otp_code),

                "recipient_email":
                    recipient_email,

                "name":
                    user_name,

                "email":
                    recipient_email,

                "to_email":
                    recipient_email,

                "purpose":
                    purpose_text,

                "time":
                    "5 minutes",

                "subject":
                    subject
            }

            # =====================================================
            # SEND
            # =====================================================

            result = self.send_email(
                recipient_email,
                subject,
                template_params=template_params
            )

            if result:

                print(
                    "[OTP EMAIL] "
                    "OTP email sent successfully.",
                    flush=True
                )

            else:

                print(
                    "[OTP EMAIL] "
                    "OTP email failed.",
                    flush=True
                )

            return result

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"OTP failure: {type(e).__name__}",
                flush=True
            )

            print(
                f"[EMAIL SERVICE ERROR] "
                f"Details: {str(e)}",
                flush=True
            )

            return False

    # =============================================================
    # RESUME ANALYSIS EMAIL
    # =============================================================

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

            target_template = (
                self.analysis_template_id
                or self.template_id
            ).strip()

            if not target_template:

                print(
                    "[EMAILJS ERROR] "
                    "No analysis template configured.",
                    flush=True
                )

                return False

            subject = (
                "ResumeWise AI - "
                f"Resume Analysis Report for {name}"
            )

            # -----------------------------------------------------
            # Convert lists to strings
            # -----------------------------------------------------

            if isinstance(strengths, list):

                strengths_text = ", ".join(
                    str(item)
                    for item in strengths
                )

            else:

                strengths_text = str(
                    strengths
                )

            if isinstance(missing_skills, list):

                missing_skills_text = ", ".join(
                    str(item)
                    for item in missing_skills
                )

            else:

                missing_skills_text = str(
                    missing_skills
                )

            if isinstance(suggestions, list):

                suggestions_text = ", ".join(
                    str(item)
                    for item in suggestions
                )

            else:

                suggestions_text = str(
                    suggestions
                )

            # =====================================================
            # TEMPLATE PARAMETERS
            # =====================================================

            template_params = {

                "name":
                    name,

                "user_name":
                    name,

                "email":
                    to_email,

                "recipient_email":
                    to_email,

                "to_email":
                    to_email,

                "target_role":
                    target_role,

                "ats_score":
                    str(ats_score),

                "strengths":
                    strengths_text,

                "missing_skills":
                    missing_skills_text,

                "suggestions":
                    suggestions_text,

                "skill_coverage":
                    str(skill_coverage),

                "subject":
                    subject
            }

            print(
                "===========================================",
                flush=True
            )

            print(
                "Template Name: resume_analysis.html",
                flush=True
            )

            print(
                f"Recipient: {to_email}",
                flush=True
            )

            print(
                "Email Type: Resume Analysis Report",
                flush=True
            )

            print(
                f"Template ID: {target_template}",
                flush=True
            )

            print(
                "===========================================",
                flush=True
            )

            # =====================================================
            # SEND
            # =====================================================

            return self.send_email(
                to_email,
                subject,
                template_params=template_params,
                override_template_id=target_template
            )

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"Analysis email failure: "
                f"{type(e).__name__}",
                flush=True
            )

            print(
                f"[EMAIL SERVICE ERROR] "
                f"Details: {str(e)}",
                flush=True
            )

            return False