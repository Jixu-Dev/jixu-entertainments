import { getLinksForRegion, getRegions } from "@/lib/data";
import type { Region } from "@/lib/types";
import { StudioStage } from "./stage/studio-stage";

interface Props {
  region: Region;
  onlyCategoryId?: string;
}

export async function RegionPage({ region, onlyCategoryId }: Props) {
  const data = await getLinksForRegion(region.code);
  const visible = onlyCategoryId
    ? data.categories.filter((c) => c.id === onlyCategoryId)
    : data.categories;

  const totalSites = data.categories.reduce((acc, c) => acc + c.sites.length, 0);

  return (
    <main className="w-full max-w-[1920px] mx-auto px-4 pb-16 pt-3 sm:px-8 lg:px-12 2xl:px-16">
      <StudioStage
        region={region}
        categories={visible}
        totalSites={totalSites}
      />
    </main>
  );
}
