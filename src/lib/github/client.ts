import "server-only";
import { Octokit } from "@octokit/rest";

const g = globalThis as unknown as { __streamvault_octo?: Map<string, Octokit> };
const cache: Map<string, Octokit> = g.__streamvault_octo ?? new Map();
g.__streamvault_octo = cache;

export function getOctokit(token: string): Octokit {
  const hit = cache.get(token);
  if (hit) return hit;
  const octo = new Octokit({ auth: token });
  cache.set(token, octo);
  return octo;
}
