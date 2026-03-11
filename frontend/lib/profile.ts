export function getStoredProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("career_profile_id");
}

export function setStoredProfileId(id: number) {
  localStorage.setItem("career_profile_id", id.toString());
}

export function clearStoredProfileId() {
  localStorage.removeItem("career_profile_id");
}

export function getStoredUserType(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("career_user_type");
}

export function setStoredUserType(type: string) {
  localStorage.setItem("career_user_type", type);
}

export function clearStoredUserType() {
  localStorage.removeItem("career_user_type");
}
