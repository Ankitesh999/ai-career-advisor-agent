import ProfileForm from "@/components/ProfileForm";

export default function CreateProfilePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Create Your Career Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Provide your academic background, skills, and interests to generate AI-powered
        career insights.
      </p>
      <div className="mt-6">
        <ProfileForm />
      </div>
    </main>
  );
}
