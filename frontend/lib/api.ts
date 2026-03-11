const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as { detail?: string };
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export interface StudentProfileCreate {
  name: string;
  twelfth_percentage: number;
  cgpa: number;
  degree: string;
  specialization: string;
  current_skills: string[];
  interests: string[];
  target_industry: string;
  projects: number;
  internships: number;
  certifications: number;
  subjects?: string[];
  math_strength?: string;
  logical_reasoning?: string;
  programming_interest?: string;
  user_type?: string;
}

export interface StudentProfileRead extends StudentProfileCreate {
  id: number;
  created_at: string;
}

export interface ResumeAnalysisRead {
  id: number;
  student_profile_id: number;
  file_name: string;
  extracted_skills: string[];
  projects: string[];
  experience: string[];
  education: string[];
  resume_score: number;
  missing_keywords: string[];
  weak_sections: string[];
  suggestions: string[];
  created_at: string;
}

export interface CareerAnalysisRead {
  id: number;
  student_profile_id: number;
  career_recommendations: { role: string; score: number }[];
  skill_gaps: { skill: string; priority: string }[];
  learning_roadmap: { stage: string; topics: string[] }[];
  salary_insights: { currency: string; estimate_min: number; estimate_max: number };
  industry_trends: { trend: string; impact: string }[];
  aiml_score?: number;
  cyber_security_score?: number;
  recommended_branch?: string;
  branch_reasoning?: { reason: string }[];
  aiml_roles?: { role: string; score: number }[];
  cyber_roles?: { role: string; score: number }[];
  aiml_skills?: string[];
  cyber_skills?: string[];
  aiml_roadmap?: { year: number; topics: string[] }[];
  cyber_roadmap?: { year: number; topics: string[] }[];
  industry_insights?: { branch: string; insight: string }[];
  created_at: string;
}

export interface EmployabilityScoreRead {
  id: number;
  student_profile_id: number;
  overall_score: number;
  academic_strength: number;
  technical_skills: number;
  industry_readiness: number;
  resume_quality: number;
  created_at: string;
}

export interface CompanyFitRead {
  id: number;
  student_profile_id: number;
  matches: { company: string; score: number; rationale?: string | null }[];
  created_at: string;
}

export interface RoleGapRead {
  id: number;
  student_profile_id: number;
  role_gaps: { role: string; missing_skills: string[]; learning_plan: string[] }[];
  created_at: string;
}

export interface PlacementRiskRead {
  id: number;
  student_profile_id: number;
  risk_level: string;
  reasons: string[];
  created_at: string;
}

export interface AdminMetricsRead {
  total_profiles: number;
  total_students: number;
  placement_ready: number;
  needs_training: number;
  high_risk: number;
}

export interface AdminStudentRead {
  profile_id: number;
  user_id: number;
  name: string;
  degree: string;
  specialization: string;
  cgpa: number;
  created_at: string;
  employability_score: number | null;
  placement_risk: string | null;
}

export interface TrainingRecommendationsRead {
  total_students: number;
  weak_skills: { skill: string; count: number }[];
  programs: { title: string; focus_skills: string[]; description: string }[];
}

export interface InternshipReadinessRead {
  id: number;
  student_profile_id: number;
  readiness_score: number;
  readiness_level: string;
  action_plan: string[];
  created_at: string;
}

export interface IndustryDemandRead {
  year: number;
  trends: { trend: string; impact: string }[];
}

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type MeResponse = {
  email: string;
  role: string;
};

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function setAuthRole(role: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
}

export function getAuthRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function clearAuthRole() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROLE_KEY);
}

export async function registerUser(email: string, password: string): Promise<void> {
  await request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/v1/auth/me");
}

export function createProfile(payload: StudentProfileCreate): Promise<StudentProfileRead> {
  return request<StudentProfileRead>("/api/v1/profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile(id: number): Promise<StudentProfileRead> {
  return request<StudentProfileRead>(`/api/v1/profiles/${id}`);
}

export function updateProfile(
  id: number,
  payload: StudentProfileCreate
): Promise<StudentProfileRead> {
  return request<StudentProfileRead>(`/api/v1/profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listProfiles(): Promise<StudentProfileRead[]> {
  return request<StudentProfileRead[]>("/api/v1/profiles");
}

export function generateAnalysis(profileId: number): Promise<CareerAnalysisRead> {
  return request<CareerAnalysisRead>(`/api/v1/analysis/${profileId}`, {
    method: "POST",
  });
}

export function generateBranchAnalysis(profileId: number): Promise<CareerAnalysisRead> {
  return request<CareerAnalysisRead>(`/api/v1/branch-analysis/${profileId}`, {
    method: "POST",
  });
}

export function getAnalysis(profileId: number): Promise<CareerAnalysisRead> {
  return request<CareerAnalysisRead>(`/api/v1/analysis/${profileId}`);
}

export function getEmployabilityScore(
  profileId: number
): Promise<EmployabilityScoreRead> {
  return request<EmployabilityScoreRead>(`/api/v1/employability/${profileId}`);
}

export function computeEmployabilityScore(
  profileId: number
): Promise<EmployabilityScoreRead> {
  return request<EmployabilityScoreRead>(`/api/v1/employability/${profileId}`, {
    method: "POST",
  });
}

export function getCompanyFit(profileId: number): Promise<CompanyFitRead> {
  return request<CompanyFitRead>(`/api/v1/company-fit/${profileId}`);
}

export function generateCompanyFit(profileId: number): Promise<CompanyFitRead> {
  return request<CompanyFitRead>(`/api/v1/company-fit/${profileId}`, {
    method: "POST",
  });
}

export function getRoleGaps(profileId: number): Promise<RoleGapRead> {
  return request<RoleGapRead>(`/api/v1/role-gaps/${profileId}`);
}

export function generateRoleGaps(profileId: number): Promise<RoleGapRead> {
  return request<RoleGapRead>(`/api/v1/role-gaps/${profileId}`, {
    method: "POST",
  });
}

export function getPlacementRisk(profileId: number): Promise<PlacementRiskRead> {
  return request<PlacementRiskRead>(`/api/v1/placement-risk/${profileId}`);
}

export function generatePlacementRisk(
  profileId: number
): Promise<PlacementRiskRead> {
  return request<PlacementRiskRead>(`/api/v1/placement-risk/${profileId}`, {
    method: "POST",
  });
}

export function getAdminMetrics(): Promise<AdminMetricsRead> {
  return request<AdminMetricsRead>("/api/v1/admin/metrics");
}

export function listAdminStudents(): Promise<AdminStudentRead[]> {
  return request<AdminStudentRead[]>("/api/v1/admin/students");
}

export function getTrainingRecommendations(): Promise<TrainingRecommendationsRead> {
  return request<TrainingRecommendationsRead>("/api/v1/training/recommendations");
}

export function getInternshipReadiness(
  profileId: number
): Promise<InternshipReadinessRead> {
  return request<InternshipReadinessRead>(`/api/v1/internship-readiness/${profileId}`);
}

export function generateInternshipReadiness(
  profileId: number
): Promise<InternshipReadinessRead> {
  return request<InternshipReadinessRead>(`/api/v1/internship-readiness/${profileId}`, {
    method: "POST",
  });
}

export function getIndustryDemand(): Promise<IndustryDemandRead> {
  return request<IndustryDemandRead>("/api/v1/industry-demand");
}

export async function uploadResume(
  profileId: number,
  file: File
): Promise<ResumeAnalysisRead> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/v1/resume/${profileId}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as { detail?: string };
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }

  return (await response.json()) as ResumeAnalysisRead;
}

export function getResumeAnalysis(profileId: number): Promise<ResumeAnalysisRead> {
  return request<ResumeAnalysisRead>(`/api/v1/resume/${profileId}`);
}

export function formatINR(value: number) {
  const lakhs = value / 100000;
  return `₹${lakhs.toFixed(1)}L`;
}

export type { JsonValue };
