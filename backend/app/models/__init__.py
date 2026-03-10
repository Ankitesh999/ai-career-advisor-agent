# Import models here so SQLAlchemy metadata is populated when needed.
from app.models.career_analysis import CareerAnalysis  # noqa: F401
from app.models.company_fit import CompanyFit  # noqa: F401
from app.models.employability_score import EmployabilityScore  # noqa: F401
from app.models.resume_analysis import ResumeAnalysis  # noqa: F401
from app.models.role_gap_analysis import RoleGapAnalysis  # noqa: F401
from app.models.student_profile import StudentProfile  # noqa: F401
from app.models.user import User  # noqa: F401
