"use client";

import { useEffect, useState, useContext } from "react";
import { destinationsApi } from "@/lib/api-client";
import AiRecommendations from "./aiRecommendations";
import FeaturedDestinations from "./featuredDestinations";
import Hero from "./hero";
import FeaturedExperiences from "./featuredExperiences";
import ErrorMessage from "./errorMessage";
import AllExperiences from "./allExperiences";
import { destinationContext } from "@/lib/contexts/DestinationContext";
import type { DestinationContext } from "@/lib/contexts/DestinationContext";
import type { Destination } from "@/lib/types/reisen";

export default function DestinationResults() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [status, setStatus] = useState<{
    hasError: boolean;
    errorMessage: string;
    isLoading: boolean;
  }>({ hasError: false, errorMessage: "", isLoading: true });
  const { slug } = useContext(destinationContext) as DestinationContext;

  useEffect(() => {
    async function getDestination() {
      setStatus({ hasError: false, isLoading: true, errorMessage: "" });
      try {
        const destination = await destinationsApi.getBySlug(slug);
        setDestination(destination);
      } catch (error: unknown) {
        setStatus((prevStatus) => ({
          ...prevStatus,
          hasError: true,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Failed to load destination.",
        }));
      } finally {
        setStatus((prevStatus) => {
          return {
            ...prevStatus,
            isLoading: false,
          };
        });
      }
    }
    getDestination();
  }, [slug]);

  return (
    <div className="flex place-content-center bg-[linear-gradient(to_top,#cfbeea,#f9fafb_80%)]">
      <section className="section-wrapper items-start justify-center gap-5 lg:gap-10 min-h-screen pt-0">
        {status.hasError ? (
          <ErrorMessage errorMessage={status.errorMessage} />
        ) : (
          <>
            <Hero destination={destination} />
            <div className="flex w-full flex-col gap-12">
              <AiRecommendations />
              <AllExperiences destination={destination} />
              <FeaturedExperiences />
              <FeaturedDestinations />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
