from __future__ import annotations

from collections import defaultdict
import logging

from app.models.student_profile import StudentProfile
from app.services.llm_client import LLMClient


logger = logging.getLogger(__name__)


class CareerAIEngine:
    def __init__(self, use_llm: bool = True) -> None:
        self.use_llm = use_llm
        self._llm_client = LLMClient() if use_llm else None
        self._llm_cache: dict[str, dict] = {}

    def _get_llm_output(self, profile: StudentProfile) -> dict:
        if self._llm_client is None:
            raise RuntimeError("LLM client is not configured")
        profile_id = profile.id
        if profile_id is None:
            raise ValueError("Profile ID is required for LLM caching.")
        cache_key = f"career_{profile_id}"
        if cache_key not in self._llm_cache:
            self._llm_cache[cache_key] = self._llm_client.generate_career_analysis(
                profile
            )
        return self._llm_cache[cache_key]

    def _get_branch_llm_output(self, profile: StudentProfile) -> dict:
        if self._llm_client is None:
            raise RuntimeError("LLM client is not configured")
        profile_id = profile.id
        if profile_id is None:
            raise ValueError("Profile ID is required for LLM caching.")
        cache_key = f"branch_{profile_id}"
        if cache_key not in self._llm_cache:
            self._llm_cache[cache_key] = self._llm_client.generate_branch_analysis(
                profile
            )
        return self._llm_cache[cache_key]

    def _try_llm(self, profile: StudentProfile) -> dict | None:
        if not self.use_llm:
            return None
        try:
            return self._get_llm_output(profile)
        except Exception as exc:
            logger.warning("LLM failed, falling back to rule engine: %s", exc)
            self.use_llm = False
            return None

    def generate_career_recommendations(self, profile: StudentProfile) -> list[dict]:
        llm_output = self._try_llm(profile)
        if llm_output:
            return llm_output["career_recommendations"]
        roles: dict[str, int] = defaultdict(int)

        specialization = profile.specialization.lower()
        skills = {skill.lower() for skill in profile.current_skills}

        if "ai" in specialization or "machine learning" in specialization:
            roles["AI Engineer"] += 60
            roles["Machine Learning Engineer"] += 55
            roles["Data Scientist"] += 45

        if "data" in specialization or "analytics" in specialization:
            roles["Data Scientist"] += 55
            roles["Data Analyst"] += 50

        if "software" in specialization or "computer" in specialization:
            roles["Backend Engineer"] += 45
            roles["Full Stack Engineer"] += 40

        if "python" in skills:
            roles["Data Scientist"] += 10
            roles["Machine Learning Engineer"] += 10
            roles["Backend Engineer"] += 5

        if "sql" in skills:
            roles["Data Scientist"] += 8
            roles["Data Analyst"] += 8

        if "java" in skills or "javascript" in skills or "typescript" in skills:
            roles["Backend Engineer"] += 8
            roles["Full Stack Engineer"] += 8

        if not roles:
            roles["Software Engineer"] = 50
            roles["Data Analyst"] = 45

        recommendations = [
            {"role": role, "score": min(score, 95)} for role, score in roles.items()
        ]
        recommendations.sort(key=lambda item: item["score"], reverse=True)
        return recommendations[:5]

    def generate_skill_gaps(self, profile: StudentProfile) -> list[dict]:
        llm_output = self._try_llm(profile)
        if llm_output:
            return llm_output["skill_gaps"]
        skills = {skill.lower() for skill in profile.current_skills}
        gaps: list[dict] = []

        if (
            "ai" in profile.specialization.lower()
            or "machine learning" in profile.specialization.lower()
        ):
            if "python" not in skills:
                gaps.append({"skill": "Python", "priority": "high"})
            if "ml" not in skills and "machine learning" not in skills:
                gaps.append({"skill": "Machine Learning", "priority": "high"})
            if "deep learning" not in skills:
                gaps.append({"skill": "Deep Learning", "priority": "medium"})
            if "sql" not in skills:
                gaps.append({"skill": "SQL", "priority": "medium"})

        if "data" in profile.specialization.lower():
            if "statistics" not in skills:
                gaps.append({"skill": "Statistics", "priority": "high"})
            if "data visualization" not in skills:
                gaps.append({"skill": "Data Visualization", "priority": "medium"})

        if not gaps:
            gaps.append({"skill": "System Design", "priority": "medium"})

        return gaps

    def generate_learning_roadmap(self, profile: StudentProfile) -> list[dict]:
        llm_output = self._try_llm(profile)
        if llm_output:
            return llm_output["learning_roadmap"]
        roadmap: list[dict] = []

        if (
            "ai" in profile.specialization.lower()
            or "machine learning" in profile.specialization.lower()
        ):
            roadmap.extend(
                [
                    {
                        "stage": "Foundations",
                        "topics": ["Python", "Linear Algebra", "Probability"],
                    },
                    {
                        "stage": "Core ML",
                        "topics": [
                            "Supervised Learning",
                            "Model Evaluation",
                            "Feature Engineering",
                        ],
                    },
                    {
                        "stage": "Advanced",
                        "topics": ["Deep Learning", "NLP", "MLOps Basics"],
                    },
                ]
            )
        elif "data" in profile.specialization.lower():
            roadmap.extend(
                [
                    {
                        "stage": "Foundations",
                        "topics": ["SQL", "Statistics", "Data Cleaning"],
                    },
                    {
                        "stage": "Analysis",
                        "topics": ["EDA", "Visualization", "Experiment Design"],
                    },
                    {
                        "stage": "Applied",
                        "topics": [
                            "Dashboards",
                            "Storytelling",
                            "Stakeholder Communication",
                        ],
                    },
                ]
            )
        else:
            roadmap.extend(
                [
                    {
                        "stage": "Foundations",
                        "topics": ["Programming", "Databases", "APIs"],
                    },
                    {
                        "stage": "Specialization",
                        "topics": ["Backend", "Cloud Basics", "Testing"],
                    },
                    {
                        "stage": "Advanced",
                        "topics": ["System Design", "Scalability", "Security"],
                    },
                ]
            )

        return roadmap

    def generate_salary_insights(self, profile: StudentProfile) -> dict:
        llm_output = self._try_llm(profile)
        if llm_output:
            return llm_output["salary_insights"]
        base = 800000
        specialization = profile.specialization.lower()
        skills = {skill.lower() for skill in profile.current_skills}

        if "ai" in specialization or "machine learning" in specialization:
            base = 1200000
        elif "data" in specialization:
            base = 1000000
        elif "software" in specialization:
            base = 1100000

        if "python" in skills:
            base += 50000
        if "sql" in skills:
            base += 30000
        if "aws" in skills or "cloud" in skills:
            base += 60000

        return {
            "currency": "INR",
            "estimate_min": max(base - 200000, 400000),
            "estimate_max": base + 250000,
            "note": "Estimates are indicative and vary by region and experience.",
        }

    def generate_industry_trends(self, profile: StudentProfile) -> list[dict]:
        llm_output = self._try_llm(profile)
        if llm_output:
            return llm_output["industry_trends"]
        specialization = profile.specialization.lower()
        trends: list[dict] = []

        if "ai" in specialization or "machine learning" in specialization:
            trends.extend(
                [
                    {"trend": "Generative AI adoption", "impact": "high"},
                    {"trend": "MLOps standardization", "impact": "medium"},
                ]
            )
        if "data" in specialization:
            trends.extend(
                [
                    {"trend": "Real-time analytics", "impact": "medium"},
                    {"trend": "Data governance focus", "impact": "medium"},
                ]
            )

        if not trends:
            trends.append({"trend": "Cloud-native development", "impact": "medium"})

        return trends

    def generate_branch_analysis(self, profile: StudentProfile) -> dict:
        llm_output = self._try_branch_llm(profile)
        if llm_output:
            return llm_output

        math_strength = (profile.math_strength or "").lower()
        logical_reasoning = (profile.logical_reasoning or "").lower()
        programming_interest = (profile.programming_interest or "").lower()
        interests = {interest.lower() for interest in profile.interests}

        aiml_score = 50
        cyber_score = 50

        if math_strength == "high":
            aiml_score += 20
            cyber_score += 5
        elif math_strength == "medium":
            aiml_score += 10
            cyber_score += 5

        if logical_reasoning == "high":
            aiml_score += 15
            cyber_score += 15
        elif logical_reasoning == "medium":
            aiml_score += 8
            cyber_score += 8

        if programming_interest == "high":
            aiml_score += 15
            cyber_score += 15
        elif programming_interest == "medium":
            aiml_score += 8
            cyber_score += 8

        if (
            "ai" in interests
            or "machine learning" in interests
            or "artificial intelligence" in interests
        ):
            aiml_score += 20
        if "cyber" in interests or "security" in interests or "hacking" in interests:
            cyber_score += 20

        aiml_score = min(aiml_score, 95)
        cyber_score = min(cyber_score, 95)

        recommended_branch = "AIML" if aiml_score >= cyber_score else "Cyber Security"

        branch_reasoning = []
        if math_strength in ["high", "medium"]:
            branch_reasoning.append(
                {"reason": f"{math_strength.title()} mathematics foundation"}
            )
        if programming_interest in ["high", "medium"]:
            branch_reasoning.append(
                {"reason": f"{programming_interest.title()} programming interest"}
            )
        if logical_reasoning in ["high", "medium"]:
            branch_reasoning.append(
                {"reason": f"{logical_reasoning.title()} logical reasoning ability"}
            )
        if "ai" in interests or "machine learning" in interests:
            branch_reasoning.append({"reason": "Interest in AI/ML technologies"})
        if "cyber" in interests or "security" in interests:
            branch_reasoning.append({"reason": "Interest in security and protection"})

        if not branch_reasoning:
            branch_reasoning.append({"reason": "Based on profile analysis"})

        aiml_roles = [
            {"role": "Machine Learning Engineer", "score": min(aiml_score + 5, 95)},
            {"role": "Data Scientist", "score": min(aiml_score, 95)},
            {"role": "AI Engineer", "score": min(aiml_score - 5, 90)},
            {"role": "AI Research Scientist", "score": min(aiml_score - 10, 85)},
        ]

        cyber_roles = [
            {"role": "Security Analyst", "score": min(cyber_score + 5, 95)},
            {"role": "Penetration Tester", "score": min(cyber_score, 95)},
            {"role": "Security Engineer", "score": min(cyber_score - 5, 90)},
            {"role": "Malware Analyst", "score": min(cyber_score - 10, 85)},
        ]

        aiml_skills = [
            "Python Programming",
            "Linear Algebra",
            "Statistics",
            "Machine Learning",
            "Deep Learning",
            "Data Analysis",
        ]

        cyber_skills = [
            "Computer Networking",
            "Linux",
            "Cryptography",
            "Ethical Hacking",
            "Security Tools",
            "Threat Analysis",
        ]

        aiml_roadmap = [
            {
                "year": 1,
                "topics": [
                    "Python Programming",
                    "Mathematics Fundamentals",
                    "Data Structures",
                ],
            },
            {"year": 2, "topics": ["Machine Learning", "Statistics", "AI Projects"]},
            {
                "year": 3,
                "topics": ["Deep Learning", "AI Internships", "Research Projects"],
            },
        ]

        cyber_roadmap = [
            {
                "year": 1,
                "topics": [
                    "Networking Fundamentals",
                    "Linux Basics",
                    "Programming Basics",
                ],
            },
            {
                "year": 2,
                "topics": ["Ethical Hacking", "Security Tools", "System Security"],
            },
            {
                "year": 3,
                "topics": [
                    "Penetration Testing",
                    "Security Certifications",
                    "Security Internships",
                ],
            },
        ]

        industry_insights = [
            {
                "branch": "AIML",
                "insight": "Rapid growth due to AI adoption across industries",
            },
            {
                "branch": "AIML",
                "insight": "Increasing demand for machine learning engineers",
            },
            {
                "branch": "AIML",
                "insight": "Strong demand in healthcare, finance, and automation sectors",
            },
            {
                "branch": "Cyber Security",
                "insight": "Global shortage of cybersecurity professionals",
            },
            {
                "branch": "Cyber Security",
                "insight": "Rising cyber threats increasing demand for security experts",
            },
            {
                "branch": "Cyber Security",
                "insight": "High demand across government and private sectors",
            },
        ]

        return {
            "aiml_score": aiml_score,
            "cyber_security_score": cyber_score,
            "recommended_branch": recommended_branch,
            "branch_reasoning": branch_reasoning,
            "aiml_roles": aiml_roles,
            "cyber_roles": cyber_roles,
            "aiml_skills": aiml_skills,
            "cyber_skills": cyber_skills,
            "aiml_roadmap": aiml_roadmap,
            "cyber_roadmap": cyber_roadmap,
            "industry_insights": industry_insights,
        }

    def _try_branch_llm(self, profile: StudentProfile) -> dict | None:
        if not self.use_llm:
            return None
        try:
            return self._get_branch_llm_output(profile)
        except Exception as exc:
            logger.warning(
                "LLM branch analysis failed, falling back to rule engine: %s", exc
            )
            return None
