import os
import sys

import pytest
from flask import Flask
from unittest.mock import MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from services.email_service import EmailService


def _setup_emailjs_env(monkeypatch):
    monkeypatch.setenv("EMAILJS_SERVICE_ID", "service_74mzuuu")
    monkeypatch.setenv("EMAILJS_TEMPLATE_ID", "template_spyre9o")
    monkeypatch.setenv("EMAILJS_PUBLIC_KEY", "1v87xxm1HIPzQRXBV")
    monkeypatch.setenv("EMAILJS_PRIVATE_KEY", "private_test_key")


def test_send_analysis_email_builds_emailjs_payload_and_returns_true(monkeypatch):
    _setup_emailjs_env(monkeypatch)

    captured = {}

    def fake_post(url, json, headers, timeout):
        captured["url"] = url
        captured["json"] = json
        captured["headers"] = headers
        captured["timeout"] = timeout

        response = MagicMock()
        response.status_code = 200
        response.text = "OK"
        return response

    monkeypatch.setattr(
        "services.email_service.requests.post",
        fake_post,
    )

    app = Flask(__name__)
    with app.app_context():
        email_service = EmailService()
        result = email_service.send_analysis_email(
            to_email="user@example.com",
            name="Alice",
            target_role="Software Engineer",
            ats_score=92,
            strengths=["Leadership", "Problem solving"],
            missing_skills=["Docker"],
            suggestions=["Tailor your resume to the job description"],
            skill_coverage=85,
        )

    assert result is True
    assert captured["url"] == email_service.EMAILJS_URL

    payload = captured["json"]
    assert payload["service_id"] == "service_74mzuuu"
    assert payload["template_id"] == "template_spyre9o"
    assert payload["user_id"] == "1v87xxm1HIPzQRXBV"
    assert payload["accessToken"] == "private_test_key"
    assert "template_params" in payload
    assert payload["template_params"]["to_email"] == "user@example.com"
    assert payload["template_params"]["name"] == "Alice"
    assert payload["template_params"]["ats_score"] == "92"
    assert "strengths" in payload["template_params"]


def test_send_analysis_email_returns_false_when_emailjs_returns_error(monkeypatch):
    _setup_emailjs_env(monkeypatch)

    def fake_post(url, json, headers, timeout):
        response = MagicMock()
        response.status_code = 403
        response.text = "Forbidden"
        return response

    monkeypatch.setattr(
        "services.email_service.requests.post",
        fake_post,
    )

    app = Flask(__name__)
    with app.app_context():
        email_service = EmailService()
        result = email_service.send_analysis_email(
            to_email="user@example.com",
            name="Alice",
            target_role="Software Engineer",
            ats_score=92,
            strengths=["Leadership", "Problem solving"],
            missing_skills=["Docker"],
            suggestions=["Tailor your resume to the job description"],
            skill_coverage=85,
        )

    assert result is False
