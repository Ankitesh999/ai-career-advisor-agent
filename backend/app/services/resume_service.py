from __future__ import annotations

import io
import re
from pathlib import Path
from typing import Iterable
from uuid import uuid4

from docx import Document
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume_analysis import ResumeAnalysis
from app.models.student_profile import StudentProfile

STORAGE_ROOT = Path("storage/resumes")
MAX_BYTES = 5 * 1024 * 1024
ALLOWED_EXTS = {".pdf", ".docx"}

KNOWN_SKILLS = {
    "python",
    "sql",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c",
    "react",
    "node",
    "django",
    "fastapi",
    "flask",
    "pytorch",
    "tensorflow",
    "scikit-learn",
    "pandas",
    "numpy",
    "power bi",
    "tableau",
    "git",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "spark",
    "hadoop",
    "nlp",
    "mlops",
}

INDUSTRY_KEYWORDS = {
    "ai": {"machine learning", "deep learning", "nlp", "mlops", "pytorch", "tensorflow"},
    "ml": {"machine learning", "deep learning", "feature engineering", "mlops"},
    "data": {"statistics", "sql", "python", "pandas", "machine learning"},
    "backend": {"api", "database", "sql", "python", "java", "node", "system design"},
}


class ResumeService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_latest_by_profile(self, profile_id: int) -> ResumeAnalysis | None:
        stmt = (
            select(ResumeAnalysis)
            .where(ResumeAnalysis.student_profile_id == profile_id)
            .order_by(ResumeAnalysis.created_at.desc())
        )
        return self.db.scalar(stmt)

    def create_analysis(self, profile: StudentProfile, file_name: str, data: bytes) -> ResumeAnalysis:
        self._validate_file(file_name, data)
        stored_name = self._store_file(profile.id, file_name, data)
        text = self._extract_text(stored_name, data)
        parsed = self._parse_resume(text, profile)
        analysis = ResumeAnalysis(
            student_profile_id=profile.id,
            file_name=stored_name,
            extracted_skills=parsed["skills"],
            projects=parsed["projects"],
            experience=parsed["experience"],
            education=parsed["education"],
            resume_score=parsed["score"],
            missing_keywords=parsed["missing_keywords"],
            weak_sections=parsed["weak_sections"],
            suggestions=parsed["suggestions"],
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def _validate_file(self, file_name: str, data: bytes) -> None:
        ext = Path(file_name).suffix.lower()
        if ext not in ALLOWED_EXTS:
            raise ValueError("Only PDF or DOCX files are supported.")
        if len(data) > MAX_BYTES:
            raise ValueError("File too large. Max size is 5MB.")

    def _store_file(self, profile_id: int, file_name: str, data: bytes) -> str:
        ext = Path(file_name).suffix.lower()
        safe_name = f"{uuid4().hex}{ext}"
        target_dir = STORAGE_ROOT / str(profile_id)
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / safe_name
        target_path.write_bytes(data)
        return safe_name

    def _extract_text(self, stored_name: str, data: bytes) -> str:
        ext = Path(stored_name).suffix.lower()
        if ext == ".pdf":
            reader = PdfReader(io.BytesIO(data))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        if ext == ".docx":
            doc = Document(io.BytesIO(data))
            return "\n".join(paragraph.text for paragraph in doc.paragraphs)
        return ""

    def _parse_resume(self, text: str, profile: StudentProfile) -> dict[str, list[str] | int]:
        normalized = self._normalize(text)
        lines = [line.strip() for line in normalized.splitlines() if line.strip()]
        skills_section = self._extract_section(lines, ["skills", "technical skills"])
        projects_section = self._extract_section(lines, ["projects", "academic projects"])
        experience_section = self._extract_section(lines, ["experience", "internship", "work experience"])
        education_section = self._extract_section(lines, ["education", "academics"])

        skills = self._parse_skills(skills_section, normalized)
        projects = self._parse_list_items(projects_section)
        experience = self._parse_list_items(experience_section)
        education = self._parse_list_items(education_section)

        missing_keywords = self._missing_keywords(normalized, profile)
        weak_sections = self._weak_sections(skills, projects, experience, education)
        suggestions = self._suggestions(weak_sections, missing_keywords)
        score = self._resume_score(skills, projects, experience, education, profile)

        return {
            "skills": skills,
            "projects": projects,
            "experience": experience,
            "education": education,
            "missing_keywords": missing_keywords,
            "weak_sections": weak_sections,
            "suggestions": suggestions,
            "score": score,
        }

    def _normalize(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.replace("\u2022", "\n")).replace("•", "\n")

    def _extract_section(self, lines: list[str], headers: Iterable[str]) -> list[str]:
        header_set = {h.lower() for h in headers}
        indices = []
        for idx, line in enumerate(lines):
            lower = line.lower().strip(":")
            if any(lower.startswith(header) for header in header_set):
                indices.append(idx)
        if not indices:
            return []
        start = indices[0] + 1
        end = next((i for i in range(start, len(lines)) if lines[i].isupper()), len(lines))
        return lines[start:end]

    def _parse_list_items(self, lines: list[str]) -> list[str]:
        items = []
        for line in lines:
            cleaned = re.sub(r"^[\-\*\d\.\)\s]+", "", line).strip()
            if cleaned:
                items.append(cleaned)
        return items[:10]

    def _parse_skills(self, skills_section: list[str], normalized: str) -> list[str]:
        if skills_section:
            joined = " ".join(skills_section)
            parts = re.split(r"[,\|/;]", joined)
            skills = [part.strip() for part in parts if part.strip()]
            return list(dict.fromkeys(skills))[:20]
        found = [skill for skill in KNOWN_SKILLS if skill in normalized.lower()]
        return sorted(found)

    def _missing_keywords(self, normalized: str, profile: StudentProfile) -> list[str]:
        text = normalized.lower()
        domain = f"{profile.target_industry} {profile.specialization}".lower()
        keywords: set[str] = set()
        for key, values in INDUSTRY_KEYWORDS.items():
            if key in domain:
                keywords |= values
        if not keywords:
            keywords = {"communication", "problem solving", "projects", "sql", "python"}
        return sorted([kw for kw in keywords if kw not in text])[:10]

    def _weak_sections(
        self,
        skills: list[str],
        projects: list[str],
        experience: list[str],
        education: list[str],
    ) -> list[str]:
        weak = []
        if len(skills) < 4:
            weak.append("skills")
        if not projects:
            weak.append("projects")
        if not experience:
            weak.append("experience")
        if not education:
            weak.append("education")
        return weak

    def _suggestions(self, weak_sections: list[str], missing_keywords: list[str]) -> list[str]:
        suggestions = []
        if "skills" in weak_sections:
            suggestions.append("Add a dedicated skills section with tools and technologies.")
        if "projects" in weak_sections:
            suggestions.append("Include 2-3 academic or personal projects with outcomes.")
        if "experience" in weak_sections:
            suggestions.append("Highlight internships, freelancing, or relevant coursework.")
        if missing_keywords:
            suggestions.append(
                f"Consider adding these keywords: {', '.join(missing_keywords[:5])}."
            )
        return suggestions[:6]

    def _resume_score(
        self,
        skills: list[str],
        projects: list[str],
        experience: list[str],
        education: list[str],
        profile: StudentProfile,
    ) -> int:
        score = 50
        score += min(len(skills) * 2, 20)
        score += min(len(projects) * 5, 15)
        score += min(len(experience) * 5, 10)
        score += 5 if education else 0
        score += 5 if profile.certifications else 0
        return max(0, min(score, 100))
