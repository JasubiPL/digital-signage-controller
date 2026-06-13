import { CampaignListPage } from "../campaign-list-page";

type PageProps = {
  params: Promise<{
    companySlug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CompanyCampaignsPage({
  params,
  searchParams,
}: PageProps) {
  const { companySlug } = await params;

  return (
    <CampaignListPage companySlug={companySlug} searchParams={searchParams} />
  );
}
