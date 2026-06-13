import { CampaignListPage } from "./campaign-list-page";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default function CampaignsPage({ searchParams }: PageProps) {
  return <CampaignListPage searchParams={searchParams} />;
}
