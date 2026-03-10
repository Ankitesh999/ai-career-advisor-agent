from __future__ import annotations

from app.models.student_profile import StudentProfile


class LLMClient:
    def generate_career_analysis(self, profile: StudentProfile) -> dict:
        prompt = (
            "Generate career insights for the following student profile:\n"
            f"Name: {profile.name}\n"
            f"Twelfth Percentage: {profile.twelfth_percentage}\n"
            f"Degree: {profile.degree}\n"
            f"Specialization: {profile.specialization}\n"
            f"Current Skills: {', '.join(profile.current_skills)}\n"
            f"Interests: {', '.join(profile.interests)}\n"
            f"Target Industry: {profile.target_industry}\n"
        )

        _ = prompt

        return {
            "career_recommendations": [
                {"role": "AI Engineer", "score": 82},
                {"role": "Data Scientist", "score": 76},
            ],
            "skill_gaps": [{"skill": "Machine Learning", "priority": "high"}],
            "learning_roadmap": [
                {"stage": "Foundations", "topics": ["Python", "Statistics"]},
            ],
            "salary_insights": {
                "currency": "INR",
                "estimate_min": 600000,
                "estimate_max": 1200000,
            },
            "industry_trends": [{"trend": "AI Agents", "impact": "high"}],
        }
