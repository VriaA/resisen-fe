"use client";

import { useContext, useEffect, useState } from "react";
import { useDestinationModal } from "@/components/home/destinationExperienceModal";
import { destinationsApi } from "@/lib/api-client";
import { Destination } from "@/lib/types/reisen";
import DestinationCard from "../destinationCard";
import InfoMessage from "./infoMessage";
import ErrorMessage from "./errorMessage";
import LoadingSkeleton from "./loadingSkeleton";
import { destinationContext } from "@/lib/contexts/DestinationContext";
import type { DestinationContext } from "@/lib/contexts/DestinationContext";

export default function FeaturedDestinations() {
  const { open, modal } = useDestinationModal();
  const [featuredDestinations, setFeaturedDestinations] = useState<
    Destination[] | null
  >(null);
  const [status, setStatus] = useState<{
    hasError: boolean;
    errorMessage: string;
    isLoading: boolean;
  }>({ hasError: false, errorMessage: "", isLoading: false });

  const { slug } = useContext(destinationContext) as DestinationContext;

  useEffect(() => {
    async function getDestinations() {
      setStatus({ hasError: false, errorMessage: "", isLoading: true });
      try {
        const destinations = await destinationsApi.featured();
        setFeaturedDestinations(() => destinations);
      } catch (error: unknown) {
        setStatus((prevStatus) => {
          return {
            ...prevStatus,
            hasError: true,
            errorMessage:
              error instanceof Error
                ? error.message
                : "Something went wrong, try again.",
          };
        });
      } finally {
        setStatus((prevStatus) => {
          return {
            ...prevStatus,
            isLoading: false,
          };
        });
      }
    }
    getDestinations();
  }, []);

  return (
    <div className="flex w-full flex-col gap-5 ">
      <h2 className="text-section-title text-dark-base">
        Featured destinations
      </h2>

      {status.isLoading ? (
        <LoadingSkeleton />
      ) : status.hasError ? (
        <ErrorMessage errorMessage={status.errorMessage} />
      ) : featuredDestinations && featuredDestinations.length ? (
        <div className="card-result-grid w-full">
          {featuredDestinations
            .filter((destination) => destination.slug !== slug)
            .map((dest) => (
              <DestinationCard
                key={dest.slug}
                destination={dest}
                onOpen={open}
              />
            ))}
        </div>
      ) : (
        <InfoMessage message="Featured destinations will be added soon." />
      )}
      {modal}
    </div>
  );
}
