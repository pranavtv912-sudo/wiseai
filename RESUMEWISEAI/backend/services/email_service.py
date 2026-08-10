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
        # ---------------------------------------------------------
        # EmailJS configuration
        # ---------------------------------------------------------

        self.service_id = os.getenv(
            "EMAILJS_SERVICE_ID",
            ""
        ).strip()

        self.template_id = os.getenv(
            "EMAILJS_TEMPLATE_ID",
            ""
        ).strip()

        self.public_key = os.getenv(
            "EMAILJS_PUBLIC_KEY",
            ""
        ).strip()

        self.analysis_template_id = os.getenv(
            "EMAILJS_ANALYSIS_TEMPLATE_ID",
            ""
        ).strip()

        # ---------------------------------------------------------
        # DO NOT use the private key for now.
        #
        # Your EmailJS dashboard test is working with the
        # Service + Template + Public Key configuration.
        #
        # We will first make Python behave exactly the same way.
        # ---------------------------------------------------------

        self.private_key = os.getenv(
            "EMAILJS_PRIVATE_KEY",
            ""
        ).strip()

    # =============================================================
    # CONFIGURATION CHECK
    # =============================================================

    def _check_configuration(self, template_id):
        """
        Check whether the required EmailJS configuration exists.
        """

        print(
            "========== EMAILJS CONFIGURATION ==========",
            flush=True
        )

        print(
            f"Service ID configured: "
            f"{bool(self.service_id)}",
            flush=True
        )

        print(
            f"Template ID configured: "
            f"{bool(template_id)}",
            flush=True
        )

        print(
            f"Public Key configured: "
            f"{bool(self.public_key)}",
            flush=True
        )

        print(
            f"Private Key configured: "
            f"{bool(self.private_key)}",
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
                "[EMAILJS ERROR] "
                "EMAILJS_SERVICE_ID is missing.",
                flush=True
            )
            return False

        if not template_id:
            print(
                "[EMAILJS ERROR] "
                "EMAILJS_TEMPLATE_ID is missing.",
                flush=True
            )
            return False

        if not self.public_key:
            print(
                "[EMAILJS ERROR] "
                "EMAILJS_PUBLIC_KEY is missing.",
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
        """
        Send an email using EmailJS REST API.
        """

        # ---------------------------------------------------------
        # Select template
        # ---------------------------------------------------------

        target_template_id = (
            override_template_id
            or self.template_id
        ).strip()

        # ---------------------------------------------------------
        # Validate configuration
        # ---------------------------------------------------------

        if not self._check_configuration(
            target_template_id
        ):
            return False

        # ---------------------------------------------------------
        # Prepare template parameters
        # ---------------------------------------------------------

        if template_params is None:
            template_params = {}

        # Make a copy so the caller's dictionary isn't modified.
        template_params = dict(template_params)

        # ---------------------------------------------------------
        # Default parameters
        # ---------------------------------------------------------

        if "name" not in template_params:
            template_params["name"] = (
                recipient.split("@")[0]
            )

        if "user_name" not in template_params:
            template_params["user_name"] = (
                recipient.split("@")[0]
            )

        if "email" not in template_params:
            template_params["email"] = recipient

        if "recipient_email" not in template_params:
            template_params["recipient_email"] = recipient

        if "to_email" not in template_params:
            template_params["to_email"] = recipient

        if "subject" not in template_params:
            template_params["subject"] = subject

        # ---------------------------------------------------------
        # IMPORTANT
        #
        # We don't need to send HTML from Python because the HTML
        # already exists inside the EmailJS template.
        #
        # html_body is kept only for compatibility with older code.
        # ---------------------------------------------------------

        if html_body:
            template_params.setdefault(
                "html_content",
                html_body
            )

        # ---------------------------------------------------------
        # EmailJS REST API payload
        # ---------------------------------------------------------

        payload = {
            "service_id": self.service_id,
            "template_id": target_template_id,
            "user_id": self.public_key,
            "template_params": template_params
        }

        # ---------------------------------------------------------
        # IMPORTANT:
        #
        # Do NOT send EMAILJS_PRIVATE_KEY for this test.
        #
        # Your EmailJS dashboard test succeeds, so we want Python
        # to reproduce the same basic request.
        # ---------------------------------------------------------

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
                f"[EMAILJS DISPATCH] "
                f"Service: {self.service_id}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] "
                f"Template: {target_template_id}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] "
                f"Recipient: {recipient}",
                flush=True
            )

            print(
                f"[EMAILJS DISPATCH] "
                f"Subject: {subject}",
                flush=True
            )

            # -----------------------------------------------------
            # NEVER print the Public/Private key.
            # -----------------------------------------------------

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
                f"[EMAILJS RESPONSE] "
                f"HTTP {response.status_code}",
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
                "[EMAILJS ERROR] "
                f"EmailJS returned HTTP "
                f"{response.status_code}.",
                flush=True
            )

            print(
                "[EMAILJS ERROR] "
                f"Response: {response_text[:2000]}",
                flush=True
            )

            print(
                "-------------------------------------------",
                flush=True
            )

            return False

        # ---------------------------------------------------------
        # Timeout
        # ---------------------------------------------------------

        except requests.exceptions.Timeout:

            print(
                "[EMAILJS ERROR] "
                "EmailJS request timed out.",
                flush=True
            )

            return False

        # ---------------------------------------------------------
        # Network error
        # ---------------------------------------------------------

        except requests.exceptions.RequestException as e:

            print(
                "[EMAILJS ERROR] "
                f"Network error: {type(e).__name__}",
                flush=True
            )

            print(
                f"[EMAILJS ERROR] Details: {str(e)}",
                flush=True
            )

            return False

        # ---------------------------------------------------------
        # Unexpected error
        # ---------------------------------------------------------

        except Exception as e:

            print(
                "[EMAILJS ERROR] "
                f"Unexpected error: {type(e).__name__}",
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
        """
        Send OTP verification email through EmailJS.
        """

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
                recipient_email
                .split("@")[0]
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

            # -----------------------------------------------------
            # IMPORTANT
            #
            # These parameter names MUST match the variables
            # inside your EmailJS template.
            # -----------------------------------------------------

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

            # -----------------------------------------------------
            # Send email
            # -----------------------------------------------------

            result = self.send_email(
                recipient_email,
                subject,
                template_params=template_params
            )

            # -----------------------------------------------------
            # Result logging
            # -----------------------------------------------------

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
        """
        Send resume analysis report through EmailJS.
        """

        try:

            # -----------------------------------------------------
            # Select analysis template
            # -----------------------------------------------------

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

            # -----------------------------------------------------
            # Subject
            # -----------------------------------------------------

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

            # -----------------------------------------------------
            # Template parameters
            # -----------------------------------------------------

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

            # -----------------------------------------------------
            # Logging
            # -----------------------------------------------------

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

            # -----------------------------------------------------
            # Send
            # -----------------------------------------------------

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