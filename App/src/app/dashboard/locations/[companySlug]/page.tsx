import { LocationListPage } from "../location-list-page";

type PageProps = {
  params: Promise<{
    companySlug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CompanyLocationsPage({
  params,
  searchParams,
}: PageProps) {
  const { companySlug } = await params;

  return (
    <LocationListPage companySlug={companySlug} searchParams={searchParams} />
  );
}
