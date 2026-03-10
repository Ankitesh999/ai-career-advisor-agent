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
