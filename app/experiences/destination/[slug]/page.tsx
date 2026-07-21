import DestinationResults from "@/components/destinations/destinationResults/destinationResults";
import DestinationContextProvider from "@/lib/contexts/DestinationContext";
export default async function DestinationResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <DestinationContextProvider slug={slug}>
      <DestinationResults />
    </DestinationContextProvider>
  );
}
