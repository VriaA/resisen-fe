import { useState, useContext } from "react";
import CurrentItinerary from "./currentItinerary/currentItinerary";
import SavedItineraries from "./savedItineraries";
import Form from "./form";
import { destinationContext } from "@/lib/contexts/DestinationContext";
import { ItinerariesApi } from "@/lib/api-client";
import type { DestinationContext } from "@/lib/contexts/DestinationContext";
import type {
  Experience,
  GenerateItineraryResponse,
  SavedItineraries as SavedItinerariesType,
  TripDurationUnit,
  ItineraryUIScreenOptions,
  Itinerary,
} from "@/lib/types/reisen";

export default function ItineraryLanding({
  recommended,
  prompt,
}: {
  recommended: Experience[];
  prompt: string | undefined;
}) {
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(
    getCachedItinerary(),
  );
  const [savedItineraries, setSavedItineraries] =
    useState<SavedItinerariesType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<ItineraryUIScreenOptions>(
    getCachedItinerary() ? "itinerary" : null,
  );

  const { slug } = useContext(destinationContext) as DestinationContext;

  const recommendedExperienceIds: string[] = (recommended || []).map(
    (experience) => experience.experienceId,
  );

  function getCachedItinerary(): Itinerary | null {
    if (typeof window === "undefined") return null;
    return JSON.parse(
      sessionStorage.getItem("current-currentItinerary") || "null",
    );
  }

  function updateItinerary(currentItinerary: Itinerary | null) {
    if (currentItinerary) {
      sessionStorage.setItem(
        "current-currentItinerary",
        JSON.stringify(currentItinerary),
      );
    } else {
      sessionStorage.removeItem("current-currentItinerary");
    }
    setCurrentItinerary(currentItinerary);

    setError(null);
  }

  function updateScreen(newScreen: ItineraryUIScreenOptions) {
    setScreen(newScreen);
    setError(null);
  }

  function renderForm() {
    updateItinerary(null);
    updateScreen(null);
  }

  async function genenrateItinerary(
    durationValue: number,
    durationUnit: TripDurationUnit,
  ) {
    try {
      setIsLoading(true);
      setError(null);
      const response: GenerateItineraryResponse = await ItinerariesApi.generate(
        {
          destinationSlug: slug,
          prompt: prompt || "",
          experienceIds: recommendedExperienceIds,
          durationValue: durationValue,
          durationUnit: durationUnit,
        },
      );
      updateItinerary(response.itinerary);
      updateScreen("itinerary");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function renderSavedItineraries() {
    setIsLoading(true);
    try {
      const response = await ItinerariesApi.list();
      setSavedItineraries(response);
      updateScreen("saved-itineraries");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {screen === "saved-itineraries" && savedItineraries ? (
        <SavedItineraries
          savedItineraries={savedItineraries}
          setSavedItineraries={setSavedItineraries}
          updateItinerary={updateItinerary}
          isLoading={isLoading}
          renderForm={renderForm}
          currentItinerary={currentItinerary}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
          updateScreen={updateScreen}
        />
      ) : screen === "itinerary" && currentItinerary ? (
        <CurrentItinerary
          currentItinerary={currentItinerary as Itinerary}
          updateItinerary={updateItinerary}
          renderSavedItineraries={renderSavedItineraries}
          setSavedItineraries={setSavedItineraries}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
          renderForm={renderForm}
        />
      ) : (
        <Form
          genenrateItinerary={genenrateItinerary}
          renderSavedItineraries={renderSavedItineraries}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
}
