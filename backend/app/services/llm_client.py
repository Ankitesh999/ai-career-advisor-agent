from __future__ import annotations

import json
import re
import logging

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.models.student_profile import StudentProfile

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            self.client = None
            self.model = settings.gemini_model
            return
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.gemini_model

    def _require_client(self) -> genai.Client:
        if self.client is None:
            raise RuntimeError("LLM disabled")
        return self.client

    def generate_career_analysis(self, profile: StudentProfile) -> dict:
        client = self._require_client()
        system_prompt = (
            "You are an expert career advisor and labor market analyst. "
            "Analyze the student's profile and produce structured career insights. "
            "Recommendations must consider current skills, specialization, "
            "industry trends, realistic entry-level roles, and skill gaps required. "
            "Score each career path from 0–100. "
            "Skill gap priority must be: high | medium | low. "
            "Return ONLY valid JSON that matches the required schema."
        )
        user_prompt = (
            "Generate career insights for the following student profile.\n"
            f"Name: {profile.name}\n"
            f"Degree: {profile.degree}\n"
            f"Specialization: {profile.specialization}\n"
            f"Current Skills: {', '.join(profile.current_skills)}\n"
            f"Interests: {', '.join(profile.interests)}\n"
            f"Target Industry: {profile.target_industry}\n"
            "\n"
            "Required JSON format:\n"
            "{\n"
            '  "career_recommendations":[{"role":"AI Engineer","score":82}],\n'
            '  "skill_gaps":[{"skill":"Machine Learning","priority":"high"}],\n'
            '  "learning_roadmap":[{"stage":"Foundations","topics":["Python","Statistics"]}],\n'
            '  "salary_insights":{"currency":"INR","estimate_min":600000,"estimate_max":1200000},\n'
            '  "industry_trends":[{"trend":"AI Agents","impact":"high"}]\n'
            "}\n"
        )

        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.7,
                max_output_tokens=400,
            ),
        )

        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty output.")

        data = self._parse_json(output_text)

        required_keys = {
            "career_recommendations",
            "skill_gaps",
            "learning_roadmap",
            "salary_insights",
            "industry_trends",
        }
        if not required_keys.issubset(data.keys()):
            raise ValueError("LLM JSON missing required keys.")

        if not isinstance(data["career_recommendations"], list):
            raise ValueError("Invalid career_recommendations format.")
        if not isinstance(data["skill_gaps"], list):
            raise ValueError("Invalid skill_gaps format.")
        if not isinstance(data["learning_roadmap"], list):
            raise ValueError("Invalid learning_roadmap format.")
        if not isinstance(data["salary_insights"], dict):
            raise ValueError("Invalid salary_insights format.")
        if not isinstance(data["industry_trends"], list):
            raise ValueError("Invalid industry_trends format.")

        return data

    def generate_chat_response(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.6,
        max_output_tokens: int = 400,
    ) -> str:
        client = self._require_client()
        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty response.")
        return output_text

    def generate_employability_adjustments(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_output_tokens: int = 300,
    ) -> dict:
        client = self._require_client()
        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty response.")

        return self._parse_json(output_text)

    def generate_company_fit_adjustments(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
        max_output_tokens: int = 200,
    ) -> dict:
        client = self._require_client()
        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty response.")
        data = self._parse_json(output_text)
        if not isinstance(data, dict):
            raise ValueError("LLM response must be a JSON object.")
        return data

    def generate_industry_trends(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.5,
        max_output_tokens: int = 200,
    ) -> dict:
        client = self._require_client()
        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty response.")
        data = self._parse_json(output_text)
        if not isinstance(data, dict):
            raise ValueError("LLM response must be a JSON object.")
        return data

    def _parse_json(self, output_text: str) -> dict:
        cleaned = output_text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z]*", "", cleaned).strip()
            cleaned = cleaned.rstrip("`").strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise ValueError("LLM returned invalid JSON.")

    def generate_branch_analysis(self, profile: StudentProfile) -> dict:
        client = self._require_client()

        subjects_str = (
            ", ".join(profile.subjects) if profile.subjects else "Not specified"
        )

        system_prompt = (
            "You are an expert career advisor for 12th-grade students choosing engineering branches. "
            "Analyze the student's profile and compare two engineering branches: "
            "1. Artificial Intelligence & Machine Learning (AIML) "
            "2. Cyber Security "
            "Return ONLY valid JSON that matches the required schema."
        )

        user_prompt = (
            "Analyze the following student profile for branch compatibility between AIML and Cyber Security.\n"
            f"Name: {profile.name}\n"
            f"12th Percentage: {profile.twelfth_percentage}%\n"
            f"Subjects Studied: {subjects_str}\n"
            f"Math Strength: {profile.math_strength or 'Not specified'}\n"
            f"Logical Reasoning: {profile.logical_reasoning or 'Not specified'}\n"
            f"Programming Interest: {profile.programming_interest or 'Not specified'}\n"
            f"Interests: {', '.join(profile.interests)}\n"
            f"Current Skills: {', '.join(profile.current_skills)}\n"
            f"Degree: {profile.degree}\n"
            f"Specialization: {profile.specialization}\n"
            "\n"
            "Required JSON format:\n"
            "{\n"
            '  "aiml_score": 86,\n'
            '  "cyber_security_score": 74,\n'
            '  "recommended_branch": "AIML",\n'
            '  "branch_reasoning": [{"reason": "Strong mathematics foundation"}, {"reason": "High interest in AI/ML"}],\n'
            '  "aiml_roles": [{"role": "Machine Learning Engineer", "score": 90}, {"role": "Data Scientist", "score": 85}],\n'
            '  "cyber_roles": [{"role": "Security Analyst", "score": 70}, {"role": "Penetration Tester", "score": 65}],\n'
            '  "aiml_skills": ["Python", "Linear Algebra", "Machine Learning", "Deep Learning", "Data Analysis"],\n'
            '  "cyber_skills": ["Computer Networking", "Linux", "Cryptography", "Ethical Hacking", "Security Tools"],\n'
            '  "aiml_roadmap": [{"year": 1, "topics": ["Python Programming", "Mathematics Fundamentals", "Data Structures"]}],\n'
            '  "cyber_roadmap": [{"year": 1, "topics": ["Networking Fundamentals", "Linux Basics", "Programming Basics"]}],\n'
            '  "industry_insights": [{"branch": "AIML", "insight": "Rapid growth due to AI adoption"}, {"branch": "Cyber Security", "insight": "Global shortage of cybersecurity professionals"}]\n'
            "}\n"
        )

        response = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.7,
                max_output_tokens=800,
            ),
        )

        output_text = getattr(response, "text", None)
        if not output_text:
            raise ValueError("LLM returned empty output.")

        data = self._parse_json(output_text)

        required_keys = {
            "aiml_score",
            "cyber_security_score",
            "recommended_branch",
            "branch_reasoning",
            "aiml_roles",
            "cyber_roles",
            "aiml_skills",
            "cyber_skills",
            "aiml_roadmap",
            "cyber_roadmap",
            "industry_insights",
        }
        if not required_keys.issubset(data.keys()):
            raise ValueError("LLM JSON missing required keys.")

        if not isinstance(data["aiml_score"], int):
            raise ValueError("Invalid aiml_score format.")
        if not isinstance(data["cyber_security_score"], int):
            raise ValueError("Invalid cyber_security_score format.")
        if not isinstance(data["recommended_branch"], str):
            raise ValueError("Invalid recommended_branch format.")
        if not isinstance(data["branch_reasoning"], list):
            raise ValueError("Invalid branch_reasoning format.")
        if not isinstance(data["aiml_roles"], list):
            raise ValueError("Invalid aiml_roles format.")
        if not isinstance(data["cyber_roles"], list):
            raise ValueError("Invalid cyber_roles format.")
        if not isinstance(data["aiml_skills"], list):
            raise ValueError("Invalid aiml_skills format.")
        if not isinstance(data["cyber_skills"], list):
            raise ValueError("Invalid cyber_skills format.")
        if not isinstance(data["aiml_roadmap"], list):
            raise ValueError("Invalid aiml_roadmap format.")
        if not isinstance(data["cyber_roadmap"], list):
            raise ValueError("Invalid cyber_roadmap format.")
        if not isinstance(data["industry_insights"], list):
            raise ValueError("Invalid industry_insights format.")

        return data
