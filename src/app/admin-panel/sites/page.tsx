import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getRegions } from "@/lib/data";
import { SitesEditor } from "@/components/admin/sites-editor";

export const metadata: Metadata = {
  title: "Sites · Jixu Entertainments Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin-panel/login");

  const params = await searchParams;
  const region = params.region;
  const regions = await getRegions();
  const initialRegion = (region ?? "USA").toUpperCase();
  const valid = regions.some((r) => r.code === initialRegion) ? initialRegion : "USA";

  return (
    <div className="space-y-6">
      <SitesEditor key={valid} initialRegion={valid} regions={regions} />
    </div>
  );
}
