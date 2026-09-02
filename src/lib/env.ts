function opt(names: string | string[], fallback = ""): string {
  const list = Array.isArray(names) ? names : [names];
  for (const n of list) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return fallback;
}

export const env = {
  GITHUB_CLIENT_ID: () =>
    opt(["github_oauth_client_id", "GITHUB_OAUTH_CLIENT_ID", "GITHUB_CLIENT_ID"]),
  GITHUB_CLIENT_SECRET: () =>
    opt(["github_oauth_client_secret", "GITHUB_OAUTH_CLIENT_SECRET", "GITHUB_CLIENT_SECRET"]),
  ENCRYPTION_KEY: () =>
    opt(["encryption_key", "ENCRYPTION_KEY", "SESSION_SECRET"], "0123456789abcdef0123456789abcdef"),
  SESSION_SECRET: () =>
    opt(
      ["SESSION_SECRET", "session_secret", "encryption_key", "ENCRYPTION_KEY"],
      "0123456789abcdef0123456789abcdef",
    ),
  REPO_OWNER: () => opt(["GITHUB_REPO_OWNER", "REPO_OWNER"], "Jixu-Dev"),
  REPO_NAME: () => opt(["GITHUB_REPO_NAME", "REPO_NAME"], "jixu-entertainments"),
  REPO_BRANCH: () => opt(["GITHUB_REPO_BRANCH", "REPO_BRANCH"], "main"),
  SITE_URL: () => {
    let url = opt(
      ["SITE_URL", "NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"],
      "http://localhost:3000",
    );
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    return url.replace(/\/$/, "");
  },
  REDIS_URL: () => opt("REDIS_URL", ""),
  CF_DOMAIN_ZONE: () => opt("CF_DOMAIN_ZONE", ""),
  CF_ACCOUNT_TOKEN: () => opt("CF_ACCOUNT_TOKEN", ""),
  MONGODB_URI: () => opt(["MONGODB_URI", "MONGO_URI", "MONGODB_URL", "DATABASE_URL"], ""),
  DISCORD_WEBHOOK: () => opt(["DISCORD_WEBHOOK", "DISCORD_WEBHOOK_URL"], ""),
};
