import os
import requests


class EmailService:
    """
    EmailJS REST API Email Service for ResumeWise AI.

    Handles:
    - Registration OTP emails
    - Forgot password OTP emails
    - Change password OTP emails
    - Resume analysis emails
    """

    EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send"

    def __init__(self):
        # ---------------------------------------------------------
        # EmailJS configuration
        # ---------------------------------------------------------
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

        # ---------------------------------------------------------
        # Debug configuration
        # DO NOT PRINT ACTUAL PRIVATE KEY
        # ---------------------------------------------------------
        print("========== EMAILJS CONFIGURATION ==========", flush=True)

        print(
            f"Service ID configured: {bool(self.service_id)}",
            flush=True
        )

        print(
            f"Template ID configured: {bool(self.template_id)}",
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

        if self.service_id:
            print(
                f"Service ID: {self.service_id}",
                flush=True
            )

        if self.template_id:
            print(
                f"Template ID: {self.template_id}",
                flush=True
            )

        print("===========================================", flush=True)

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
        Send an email through EmailJS REST API.

        EmailJS REST API requires:
            service_id
            template_id
            user_id = public key

        accessToken is optional and contains the private key.
        """

        # ---------------------------------------------------------
        # Select template
        # ---------------------------------------------------------

        target_template_id = (
            override_template_id or self.template_id
        ).strip()

        # ---------------------------------------------------------
        # Validate configuration
        # ---------------------------------------------------------

        if not self.service_id:
            print(
                "[EMAILJS ERROR] EMAILJS_SERVICE_ID is missing.",
                flush=True
            )
            return False

        if not target_template_id:
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

        if not recipient:
            print(
                "[EMAILJS ERROR] Recipient email is empty.",
                flush=True
            )
            return False

        # ---------------------------------------------------------
        # Prepare template parameters
        # ---------------------------------------------------------

        if template_params is None:
            template_params = {}

        # Copy dictionary so the original object is not modified
        template_params = dict(template_params)

        # ---------------------------------------------------------
        # Default parameters
        # ---------------------------------------------------------

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

        # ---------------------------------------------------------
        # Optional HTML content
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
        # Private key is OPTIONAL according to EmailJS REST API.
        #
        # If EMAILJS_PRIVATE_KEY exists, include it as accessToken.
        # ---------------------------------------------------------

        if self.private_key:
            payload["accessToken"] = self.private_key

        # ---------------------------------------------------------
        # Logging
        # ---------------------------------------------------------

        print("-------------------------------------------", flush=True)

        print(
            "[EMAILJS DISPATCH] Sending email...",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Service: {self.service_id}",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Template: {target_template_id}",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Recipient: {recipient}",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Subject: {subject}",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Public key included: "
            f"{bool(self.public_key)}",
            flush=True
        )

        print(
            f"[EMAILJS DISPATCH] Private key included: "
            f"{bool(self.private_key)}",
            flush=True
        )

        # ---------------------------------------------------------
        # Send request
        # ---------------------------------------------------------

        try:

            response = requests.post(
                self.EMAILJS_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json"
                },
                timeout=20
            )

            print(
                f"[EMAILJS RESPONSE] HTTP {response.status_code}",
                flush=True
            )

            response_text = (
                response.text or ""
            ).strip()

            if response_text:
                print(
                    f"[EMAILJS RESPONSE] {response_text}",
                    flush=True
                )

            # -----------------------------------------------------
            # Success
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
            # Error
            # -----------------------------------------------------

            print(
                f"[EMAILJS ERROR] "
                f"EmailJS returned HTTP {response.status_code}.",
                flush=True
            )

            print(
                f"[EMAILJS ERROR] Response: {response_text}",
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
                f"[EMAILJS ERROR] "
                f"Network error: {type(e).__name__}",
                flush=True
            )

            return False

        # ---------------------------------------------------------
        # Unexpected error
        # ---------------------------------------------------------

        except Exception as e:

            print(
                f"[EMAILJS ERROR] "
                f"Unexpected error: {type(e).__name__}: {str(e)}",
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
        Send ResumeWise AI resume analysis report.
        """

        try:

            # -----------------------------------------------------
            # Select analysis template
            # -----------------------------------------------------

            target_template = (
                self.analysis_template_id
                or self.template_id
            )

            if not target_template:

                print(
                    "[EMAILJS ERROR] "
                    "No analysis template configured.",
                    flush=True
                )

                return False

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

            # -----------------------------------------------------
            # Locate HTML template
            # -----------------------------------------------------

            templates_dir = os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.abspath(__file__)
                    )
                ),
                "templates"
            )

            template_path = os.path.join(
                templates_dir,
                "resume_analysis.html"
            )

            html_content = ""

            # -----------------------------------------------------
            # Read HTML template
            # -----------------------------------------------------

            try:

                with open(
                    template_path,
                    "r",
                    encoding="utf-8"
                ) as f:

                    html_content = f.read()

                # -------------------------------------------------
                # Replace template placeholders
                # -------------------------------------------------

                html_content = (
                    html_content
                    .replace(
                        "{{ user_name }}",
                        str(name)
                    )
                    .replace(
                        "{{ target_role }}",
                        str(target_role)
                    )
                    .replace(
                        "{{ ats_score }}",
                        str(ats_score)
                    )
                    .replace(
                        "{{ strengths }}",
                        ", ".join(strengths)
                        if isinstance(strengths, list)
                        else str(strengths)
                    )
                    .replace(
                        "{{ missing_skills }}",
                        ", ".join(missing_skills)
                        if isinstance(missing_skills, list)
                        else str(missing_skills)
                    )
                    .replace(
                        "{{ suggestions }}",
                        ", ".join(suggestions)
                        if isinstance(suggestions, list)
                        else str(suggestions)
                    )
                    .replace(
                        "{{ skill_coverage }}",
                        str(skill_coverage)
                    )
                )

            except Exception as file_error:

                print(
                    "[EMAILJS WARNING] "
                    f"Could not load resume_analysis.html: "
                    f"{type(file_error).__name__}: "
                    f"{str(file_error)}",
                    flush=True
                )

            # -----------------------------------------------------
            # Subject
            # -----------------------------------------------------

            subject = (
                f"ResumeWise AI - "
                f"Resume Analysis Report for {name}"
            )

            # -----------------------------------------------------
            # EmailJS parameters
            # -----------------------------------------------------

            template_params = {

                "name": name,

                "user_name": name,

                "email": to_email,

                "recipient_email": to_email,

                "to_email": to_email,

                "target_role": target_role,

                "ats_score": str(ats_score),

                "strengths": (
                    ", ".join(strengths)
                    if isinstance(strengths, list)
                    else str(strengths)
                ),

                "missing_skills": (
                    ", ".join(missing_skills)
                    if isinstance(missing_skills, list)
                    else str(missing_skills)
                ),

                "suggestions": (
                    ", ".join(suggestions)
                    if isinstance(suggestions, list)
                    else str(suggestions)
                ),

                "skill_coverage": str(skill_coverage),

                "subject": subject
            }

            # -----------------------------------------------------
            # Send
            # -----------------------------------------------------

            return self.send_email(
                recipient=to_email,
                subject=subject,
                template_params=template_params,
                html_body=html_content,
                override_template_id=target_template
            )

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"send_analysis_email failed: "
                f"{type(e).__name__}: {str(e)}",
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
        Send OTP email for:
        - register
        - forgot_password
        - change_password
        """

        try:

            # -----------------------------------------------------
            # Determine purpose
            # -----------------------------------------------------

            email_type = "OTP Verification"

            purpose_text = "Verification"

            if purpose == "register":

                purpose_text = "Account Registration"

                email_type = "Account Registration"

            elif purpose == "forgot_password":

                purpose_text = "Password Recovery"

                email_type = "Password Recovery"

            elif purpose == "change_password":

                purpose_text = "Password Reset Verification"

                email_type = "Password Reset"

            # -----------------------------------------------------
            # Username
            # -----------------------------------------------------

            user_name = recipient_email.split("@")[0]

            # -----------------------------------------------------
            # Debug information
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
                f"Email Type: {email_type}",
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
            # Locate OTP HTML template
            # -----------------------------------------------------

            templates_dir = os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.abspath(__file__)
                    )
                ),
                "templates"
            )

            template_path = os.path.join(
                templates_dir,
                "otp_email.html"
            )

            html_content = ""

            # -----------------------------------------------------
            # Read HTML template
            # -----------------------------------------------------

            try:

                with open(
                    template_path,
                    "r",
                    encoding="utf-8"
                ) as f:

                    html_content = f.read()

                # -------------------------------------------------
                # Replace placeholders
                # -------------------------------------------------

                html_content = (
                    html_content
                    .replace(
                        "{{ user_name }}",
                        str(user_name)
                    )
                    .replace(
                        "{{ otp }}",
                        str(otp_code)
                    )
                    .replace(
                        "{{ purpose_text }}",
                        str(purpose_text)
                    )
                    .replace(
                        "{{ recipient_email }}",
                        str(recipient_email)
                    )
                )

            except Exception as file_error:

                print(
                    "[EMAILJS WARNING] "
                    f"Could not load otp_email.html: "
                    f"{type(file_error).__name__}: "
                    f"{str(file_error)}",
                    flush=True
                )

            # -----------------------------------------------------
            # Email subject
            # -----------------------------------------------------

            subject = (
                f"ResumeWise AI - "
                f"{purpose_text} Verification Code"
            )

            # -----------------------------------------------------
            # EmailJS template parameters
            # -----------------------------------------------------

            template_params = {

                "purpose_text": purpose_text,

                "user_name": user_name,

                "name": user_name,

                "email": recipient_email,

                "recipient_email": recipient_email,

                "to_email": recipient_email,

                "otp": str(otp_code),

                "purpose": purpose_text,

                "time": "5 minutes",

                "subject": subject
            }

            # -----------------------------------------------------
            # Send OTP
            # -----------------------------------------------------

            result = self.send_email(
                recipient=recipient_email,
                subject=subject,
                template_params=template_params,
                html_body=html_content
            )

            if result:

                print(
                    "[OTP EMAIL] OTP email sent successfully.",
                    flush=True
                )

            else:

                print(
                    "[OTP EMAIL] OTP email failed.",
                    flush=True
                )

            return result

        except Exception as e:

            print(
                "[EMAIL SERVICE ERROR] "
                f"send_otp_email failed: "
                f"{type(e).__name__}: {str(e)}",
                flush=True
            )

            return False