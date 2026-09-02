import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Admin Sign In · Jixu Entertainments",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Your GitHub account does not have write access to this repository.",
  no_token: "GitHub did not return an access token.",
  no_user: "Failed to fetch your GitHub profile.",
  rate_limit: "GitHub API rate limit reached. Please wait a few minutes.",
  bad_code: "Invalid GitHub OAuth code. Try signing in again.",
  csrf: "Session mismatch during authentication. Try again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/admin-panel");

  const params = await searchParams;
  const error = params.error;
  const message = error ? (ERROR_MESSAGES[error] ?? `Login error: ${error}`) : null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 text-center">
      <span className="font-signature text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FF007A] via-[#8B5CF6] to-[#5B3DF5] filter drop-shadow-[0_0_12px_rgba(255,0,122,0.35)]">
        Jixu Entertainments
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-space">Admin Sign-in</h1>
        <p className="text-xs text-[var(--fg-muted)]">
          You need write access to the Jixu Entertainments repository to manage this panel.
        </p>
      </div>
      {message && (
        <div
          className="w-full rounded-2xl border px-4 py-2.5 text-xs font-semibold"
          style={{ borderColor: "var(--border)", background: "var(--bg-elev)", color: "var(--danger, #f87171)" }}
        >
          {message}
        </div>
      )}
      <a
        href="/api/auth/github/login"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-xs font-bold text-white transition hover:opacity-90 shadow-sm font-space"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        Continue with GitHub
      </a>
      <Link href="/" className="text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] font-space">
        ← Back to site
      </Link>
    </div>
  );
}
