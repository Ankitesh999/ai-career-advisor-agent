from __future__ import annotations

from collections import defaultdict

from app.models.student_profile import StudentProfile


class CareerAIEngine:
    def generate_career_recommendations(self, profile: StudentProfile) -> list[dict]:
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

        recommendations = [{"role": role, "score": min(score, 95)} for role, score in roles.items()]
        recommendations.sort(key=lambda item: item["score"], reverse=True)
        return recommendations[:5]

    def generate_skill_gaps(self, profile: StudentProfile) -> list[dict]:
        skills = {skill.lower() for skill in profile.current_skills}
        gaps: list[dict] = []

        if "ai" in profile.specialization.lower() or "machine learning" in profile.specialization.lower():
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
        roadmap: list[dict] = []

        if "ai" in profile.specialization.lower() or "machine learning" in profile.specialization.lower():
            roadmap.extend(
                [
                    {"stage": "Foundations", "topics": ["Python", "Linear Algebra", "Probability"]},
                    {"stage": "Core ML", "topics": ["Supervised Learning", "Model Evaluation", "Feature Engineering"]},
                    {"stage": "Advanced", "topics": ["Deep Learning", "NLP", "MLOps Basics"]},
                ]
            )
        elif "data" in profile.specialization.lower():
            roadmap.extend(
                [
                    {"stage": "Foundations", "topics": ["SQL", "Statistics", "Data Cleaning"]},
                    {"stage": "Analysis", "topics": ["EDA", "Visualization", "Experiment Design"]},
                    {"stage": "Applied", "topics": ["Dashboards", "Storytelling", "Stakeholder Communication"]},
                ]
            )
        else:
            roadmap.extend(
                [
                    {"stage": "Foundations", "topics": ["Programming", "Databases", "APIs"]},
                    {"stage": "Specialization", "topics": ["Backend", "Cloud Basics", "Testing"]},
                    {"stage": "Advanced", "topics": ["System Design", "Scalability", "Security"]},
                ]
            )

        return roadmap

    def generate_salary_insights(self, profile: StudentProfile) -> dict:
        base = 60000
        specialization = profile.specialization.lower()
        skills = {skill.lower() for skill in profile.current_skills}

        if "ai" in specialization or "machine learning" in specialization:
            base = 90000
        elif "data" in specialization:
            base = 80000
        elif "software" in specialization:
            base = 85000

        if "python" in skills:
            base += 3000
        if "sql" in skills:
            base += 2000
        if "aws" in skills or "cloud" in skills:
            base += 4000

        return {
            "currency": "USD",
            "estimate_min": max(base - 10000, 40000),
            "estimate_max": base + 15000,
            "note": "Estimates are indicative and vary by region and experience.",
        }

    def generate_industry_trends(self, profile: StudentProfile) -> list[dict]:
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
