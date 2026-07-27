"use client";

import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import Link from "next/link";
import CheckpointDetails from "./checkpointDetails";
import { Layout } from "../layout";
import { Clock, Heart, LoaderCircle, PlusCircle } from "lucide-react";
import { ApiRequestError, ItinerariesApi } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import type {
  Itinerary,
  ItineraryCheckpoint,
  SavedItineraries,
} from "@/lib/types/resisen";

interface CurrentItineraryProps {
  currentItinerary: Itinerary;
  updateItinerary: (currentItinerary: Itinerary | null) => void;
  renderSavedItineraries: () => Promise<void>;
  setSavedItineraries: React.Dispatch<
    React.SetStateAction<SavedItineraries | null>
  >;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  renderForm: () => void;
}

export default function CurrentItinerary({
  currentItinerary,
  updateItinerary,
  renderSavedItineraries,
  setSavedItineraries,
  isLoading,
  setIsLoading,
  error,
  setError,
  renderForm,
}: CurrentItineraryProps) {
  const {
    checkpoints,
    currency,
    totalPrice,
    destination,
    durationValue,
    durationUnit,
    destinationSlug,
    prompt,
    itineraryId,
  } = currentItinerary as Itinerary;

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  useEffect(() => {
    async function checkSaved() {
      setIsLoading(true);
      try {
        const savedItinerary = await ItinerariesApi.get(itineraryId);
        if (savedItinerary) setIsSaved(true);
      } catch (error) {
        if (error instanceof ApiRequestError) {
          if (error.status === 404) setIsSaved(false);
          return;
        }
        if (error instanceof Error) setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    checkSaved();
  }, [itineraryId, setIsLoading, setError]);

  const isDisabled = useMemo(
    () => isLoading || isSaving,
    [isLoading, isSaving],
  );

  function getExperienceIds(checkpoints: ItineraryCheckpoint[]) {
    return checkpoints.map((checkpoint) => checkpoint.experienceId);
  }

  async function saveItinerary() {
    setIsLoading(true);
    setIsSaving(true);
    setError(null);
    try {
      const experienceIds: string[] = getExperienceIds(checkpoints);

      await ItinerariesApi.save({
        experienceIds,
        destinationSlug,
        durationUnit,
        durationValue,
        prompt,
        itineraryId,
      });
      setIsSaved(true);
      setSavedItineraries(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  }

  async function startItinerary(itineraryId: string) {
    setIsLoading(true);
    setIsStarting(true);
    setError(null);

    try {
      let response;
      if (isSaved) {
        response = await ItinerariesApi.startSaved(itineraryId);
      } else {
        const experienceIds = getExperienceIds(checkpoints);
        response = await ItinerariesApi.start({
          itineraryId,
          prompt,
          destinationSlug,
          durationUnit,
          durationValue,
          start: true,
          experienceIds,
        });
      }
      if (response) {
        updateItinerary(response);
        if (!isSaved) setIsSaved(true);
        setSavedItineraries(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setIsStarting(false);
    }
  }

  return (
    <Layout>
      {currentItinerary.status === "completed" && (
        <Confetti
          colors={["#7f5ccc", "#e12afb", "#2d2d2d", "#faf9f6"]}
          style={{ margin: "auto", width: "100%", height: "100%" }}
          gravity={0.05}
        />
      )}

      <div className="relative flex flex-col gap-1">
        <h2 className="text-section-inner-title text-dark-base">
          {destination} Itinerary
        </h2>

        <p className="flex gap-1 items-center text-body-regular text-dark-base">
          <Clock size={16} />
          {durationValue}&nbsp;
          {durationUnit}
        </p>

        <p className="text-body-medium text-success">
          {formatPrice(totalPrice, currency)}
        </p>

        {/* ------- SECONDARY CTAS ------- */}
        <div className="absolute top-0 right-0 flex gap-2 *:text-secondary *:active:translate-y-1 *:transition-colors *:duration-500 *:cursor-pointer *:disabled:opacity-60">
          <button
            aria-label="Generate new itinerary"
            title="New itinerary"
            onClick={renderForm}
            className="group disabled:cursor-not-allowed"
            disabled={isDisabled}
          >
            <PlusCircle
              size={28}
              aria-hidden="true"
              className="*:group-hover:text-dark-base"
            />
          </button>
          {!isSaved && (
            <button
              className="group disabled:cursor-not-allowed"
              title="Save itinerary"
              onClick={saveItinerary}
              disabled={isDisabled}
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Heart
                  size={28}
                  aria-hidden="true"
                  className="*:group-hover:text-dark-base"
                />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* ------- CHECKPOINTS ------- */}
        <div className="h-72.5 overflow-auto">
          <div className="relative grid grid-cols-[repeat(2,80px)] auto-rows-auto justify-center gap-10 px-5">
            <div className="absolute inset-0 top-0 w-px mx-auto h-full border-l border-dashed border-l-dark-base" />

            {checkpoints.map((checkpoint, index) => {
              const isRight = (index + 1) % 2 === 0;
              return (
                <div
                  key={checkpoint.checkpointId}
                  className={`relative flex flex-col z-1  ${isRight ? "col-start-2" : "col-start-1"}`}
                  style={{ gridRowStart: index + 1 }}
                >
                  {(checkpoint.status !== "locked" ||
                    currentItinerary.status !== "in_progress") && (
                    <Link
                      className="absolute block h-full w-full z-10 rounded-lg"
                      href={`/experiences/${checkpoint.experienceId}`}
                    />
                  )}

                  <CheckpointDetails
                    checkpoint={checkpoint}
                    isRight={isRight}
                    isDisabled={isDisabled}
                    currentItinerary={currentItinerary}
                    setError={setError}
                    setIsLoading={setIsLoading}
                    updateItinerary={updateItinerary}
                    setSavedItineraries={setSavedItineraries}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------- PRIMARY CTAS ------- */}
      {currentItinerary.status === "not_started" && (
        <button
          className="group primary-cta cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isDisabled}
          onClick={() => startItinerary(itineraryId)}
        >
          {isStarting ? (
            <span className="primary-cta-inner flex justify-center items-center w-full px-5 py-2 text-sm md:text-lg">
              Starting...
              <LoaderCircle className="animate-spin" />
            </span>
          ) : (
            <span className="primary-cta-inner w-full px-5 py-2 text-sm md:text-lg">
              Start
            </span>
          )}
        </button>
      )}

      <button
        className="rounded-[64px] text-button text-secondary active:translate-y-1 transition-all duration-500 hover:text-dark-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isDisabled}
        onClick={renderSavedItineraries}
      >
        Saved itineraries
      </button>

      {error && (
        <p className="text-small-medium text-center text-error">{error}</p>
      )}
    </Layout>
  );
}
