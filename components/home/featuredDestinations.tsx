import Image from "next/image";
import { destinationsApi, ApiRequestError } from "@/lib/api-client";
import FeaturedDestinationsCarousel from "@/components/home/featuredDestinationsCarousel";
import StateMessage from "./stateMessage";
import type { Destination } from "@/lib/types/reisen";

type FeaturedDestinationsResult =
  | { status: "ok"; destinations: Destination[] }
  | { status: "error"; message: string };

async function getFeaturedDestinations(): Promise<FeaturedDestinationsResult> {
  try {
    const { items } = await destinationsApi.list({ featured: true, limit: 20 });
    return { status: "ok", destinations: items };
  } catch (err) {
    const message =
      err instanceof ApiRequestError
        ? err.message
        : "We couldn't load featured destinations right now.";
    return { status: "error", message };
  }
}

export default async function FeaturedDestinations() {
  const result = await getFeaturedDestinations();

  return (
    <div className="relative bg-white-base flex flex-col items-center gap-5 lg:gap-10 justify-center overflow-visible my-10 lg:my-20">
      <Image
        src="/world_map.webp"
        alt=""
        width={680}
        height={400}
        className="absolute m-auto w-full max-w-400 h-full top-20 hidden md:block"
      />
      <Image
        src="/featured_destinations_heading.svg"
        alt="Need a little inspiration?"
        width={608}
        height={208}
        className="w-140 h-auto z-1"
      />
      <div className="no-scrollbar w-full max-w-400 px-5 md:px-0 py-10 md:overflow-x-scroll md:overflow-y-visible">
        {result.status === "error" ? (
          <StateMessage type="error">{result.message}</StateMessage>
        ) : result.destinations.length === 0 ? (
          <StateMessage type="info">
            Check back soon for new experiences!
          </StateMessage>
        ) : (
          <FeaturedDestinationsCarousel destinations={result.destinations} />
        )}
      </div>
    </div>
  );
}
