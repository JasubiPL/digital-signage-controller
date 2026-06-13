import { LocationListPage } from "./location-list-page";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default function LocationsPage({ searchParams }: PageProps) {
  return <LocationListPage searchParams={searchParams} />;
}
