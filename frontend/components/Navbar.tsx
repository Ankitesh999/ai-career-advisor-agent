import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          AI Career Intelligence
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-slate-900">
            Home
          </Link>
          <Link href="/create-profile" className="transition hover:text-slate-900">
            Create Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
