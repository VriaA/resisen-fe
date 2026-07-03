import { useState, useEffect } from "react";
import { experiencesApi } from "@/lib/api-client";
import ExperienceCard from "@/components/experiences/experienceCard";
import LoadingSkeleton from "./loadingSkeleton";
import InfoMessage from "./infoMessage";
import ErrorMessage from "./errorMessage";
import type { Experience } from "@/lib/types/reisen";

export default function FeaturedExperiences() {
  const FEATURED_LIMIT = 8;

  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>(
    [],
  );
  const [status, setStatus] = useState<{
    hasError: boolean;
    errorMessage: string;
    isLoading: boolean;
  }>({ hasError: false, errorMessage: "", isLoading: false });

  useEffect(() => {
    async function getExperiences() {
      setStatus(() => ({
        hasError: false,
        errorMessage: "",
        isLoading: true,
      }));
      try {
        const experiences = await experiencesApi.featured(FEATURED_LIMIT);
        setFeaturedExperiences(() => experiences);
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
    getExperiences();
  }, []);
  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-section-title text-dark-base">
        Featured experiences
      </h2>
      {status.isLoading ? (
        <LoadingSkeleton />
      ) : status.hasError ? (
        <ErrorMessage errorMessage={status.errorMessage} />
      ) : featuredExperiences && featuredExperiences.length ? (
        <div className="card-result-grid">
          {featuredExperiences.map((experience) => (
            <ExperienceCard
              key={experience.experienceId}
              experience={experience}
            />
          ))}
        </div>
      ) : (
        <InfoMessage message="Featured experiences will be added soon." />
      )}
    </div>
  );
}
