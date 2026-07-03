"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import DestinationFilters from "./destinationFilters";
import ErrorMessage from "./errorMessage";
import LoadingSkeleton from "./loadingSkeleton";
import ExperienceCard from "@/components/experiences/experienceCard";
import InfoMessage from "./infoMessage";
import { experiencesApi } from "@/lib/api-client";
import type { DestinationFilterState } from "./destinationFilters";
import type { Destination, Experience } from "@/lib/types/reisen";

export default function AllExperiences({
  destination,
  slug,
}: {
  destination: Destination | null;
  slug: string;
}) {
  const RESULTS_LIMIT = 24;
  const FILTER_DEBOUNCE_MS = 500;

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filters, setFilters] = useState<DestinationFilterState>({
    search: "",
    minPrice: "",
    maxPrice: "",
    categories: [],
  });
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const { search, minPrice, maxPrice, categories } = filters;
  const [status, setStatus] = useState<{
    hasError: boolean;
    errorMessage: string;
    isLoading: boolean;
    isLoadingMore: boolean;
  }>({
    hasError: false,
    errorMessage: "",
    isLoading: true,
    isLoadingMore: false,
  });

  function updateFilters(next: Partial<DestinationFilterState>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  async function fetchExperiences(params: {
    destination: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isLoadingMore: boolean;
  }) {
    const { isLoadingMore } = params;
    setStatus({
      hasError: false,
      errorMessage: "",
      isLoading: isLoadingMore ? false : true,
      isLoadingMore: isLoadingMore ? true : false,
    });
    try {
      const response = await experiencesApi.list({
        ...params,
        limit: RESULTS_LIMIT,
      });
      setExperiences((prevExperiences) =>
        isLoadingMore
          ? [...prevExperiences, ...response.items]
          : response.items,
      );
      setNextCursor(response.nextCursor);
      setStatus({
        hasError: false,
        errorMessage: "",
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error: unknown) {
      setStatus((prevStatus) => ({
        ...prevStatus,
        hasError: true,
        errorMessage:
          error instanceof Error
            ? error.message
            : `Could not load ${isLoadingMore ? "more" : ""} experiences for this destination.`,
      }));
    } finally {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
      }));
    }
  }

  async function loadMore() {
    if (!destination || !nextCursor || status.isLoadingMore) return;
    setStatus({
      hasError: false,
      errorMessage: "",
      isLoadingMore: true,
      isLoading: false,
    });
    await fetchExperiences({
      destination: destination.name,
      search: search.trim() || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isLoadingMore: true,
    });
  }

  const debouncedFetchList = useMemo(
    () => debounce(fetchExperiences, FILTER_DEBOUNCE_MS),
    [],
  );

  const visibleExperiences = useMemo(
    () =>
      categories.length === 0
        ? experiences
        : experiences.filter((experience) =>
            categories.includes(experience.category),
          ),
    [experiences, categories],
  );

  const hasFilters =
    search.trim() !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    categories.length > 0;

  useEffect(() => {
    if (!destination) return;
    debouncedFetchList({
      destination: destination.name,
      search: search.trim() || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isLoadingMore: false,
    });
  }, [destination, search, minPrice, maxPrice, debouncedFetchList, hasFilters]);

  useEffect(() => () => debouncedFetchList.cancel(), [debouncedFetchList]);

  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-section-title text-dark-base">
        {status.isLoading
          ? "Loading experiences"
          : destination
            ? `Experiences for ${destination?.name}`
            : "No destination for experiences"}
      </h2>

      <DestinationFilters
        filters={filters}
        onChange={updateFilters}
        currentSlug={slug}
        currentName={destination?.name ?? ""}
      />

      {status.isLoading ? (
        <LoadingSkeleton />
      ) : status.hasError || !destination ? (
        <ErrorMessage
          errorMessage={
            destination ? status.errorMessage : "Error fetching experiences"
          }
        />
      ) : visibleExperiences.length ? (
        <div className="card-result-grid">
          {visibleExperiences.map((experience) => (
            <ExperienceCard
              key={experience.experienceId}
              experience={experience}
            />
          ))}
        </div>
      ) : (
        <InfoMessage
          message={
            hasFilters
              ? "No experiences match your filters, try widening your search."
              : "No experiences listed here yet, check back soon."
          }
        />
      )}
      {nextCursor && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={status.isLoadingMore}
            className="rounded-2xl border border-secondary bg-primary-50 px-5 py-2 text-button text-secondary disabled:opacity-60 cursor-pointer"
          >
            {status.isLoadingMore ? "Loading…" : "See more"}
          </button>
          {status.hasError && (
            <ErrorMessage errorMessage={status.errorMessage} />
          )}
        </div>
      )}
    </div>
  );
}
