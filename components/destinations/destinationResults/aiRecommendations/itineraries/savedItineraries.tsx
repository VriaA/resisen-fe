import { useState } from "react";
import { Layout } from "./layout";
import {
  BookHeart,
  MapPin,
  TrashIcon,
  ClockIcon,
  LoaderCircle,
  CheckCircle,
  CircleFadingArrowUp,
  CircleMinus,
  HeartPlus,
} from "lucide-react";
import type {
  Itinerary,
  ItineraryStatus,
  SavedItineraries,
  ItineraryUIScreenOptions,
} from "@/lib/types/reisen";
import { ItinerariesApi } from "@/lib/api-client";

interface SavedItinerariesProps {
  savedItineraries: SavedItineraries | null;
  setSavedItineraries: (itineraries: SavedItineraries | null) => void;
  updateItinerary: (currentItinerary: Itinerary | null) => void;
  isLoading: boolean;
  renderForm: () => void;
  currentItinerary: Itinerary | null;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  updateScreen(newScreen: ItineraryUIScreenOptions): void;
}

const ITINERARY_STATUS_TEXT: Readonly<Record<ItineraryStatus, string>> = {
  completed: "Completed",
  in_progress: "In progress",
  not_started: "Not started",
};

export default function SavedItineraries({
  savedItineraries,
  setSavedItineraries,
  updateItinerary,
  isLoading,
  setIsLoading,
  renderForm,
  currentItinerary,
  error,
  setError,
  updateScreen,
}: SavedItinerariesProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  function renderItineraryOnClick(savedItinerary: Itinerary) {
    updateItinerary(savedItinerary);
    updateScreen("itinerary");
  }

  async function deleteItinerary(itineraryId: string) {
    setIsLoading(true);
    setError(null);
    setDeleting(itineraryId);
    try {
      await ItinerariesApi.delete(itineraryId);
      if (savedItineraries) {
        const updatedSavedItineraries = savedItineraries.items.filter(
          (itinerary) => itinerary.itineraryId !== itineraryId,
        );
        if (itineraryId === currentItinerary?.itineraryId) {
          updateItinerary(null);
        }
        setSavedItineraries({ items: updatedSavedItineraries });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setDeleting(null);
    }
  }

  return (
    <Layout>
      <h2 className="flex items-center justify-between gap-2 text-section-inner-title text-dark-base">
        Your saved Itineraries
        <BookHeart
          size={32}
          strokeWidth={1}
          className=" flex-none animate-bounce animation-duration-[5s]"
        />
      </h2>

      <div className="flex flex-col items-center gap-5 w-full">
        {savedItineraries && savedItineraries.items.length ? (
          <div className="w-full h-72.5 overflow-auto">
            <div className="flex flex-col gap-5 p-px">
              {savedItineraries.items.map((itinerary) => {
                const {
                  itineraryId,
                  destination,
                  prompt,
                  durationValue,
                  durationUnit,
                  status,
                } = itinerary;

                return (
                  <div
                    key={itineraryId}
                    className="flex justify-between gap-5 text-start w-full max-h-36.5 p-3 bg-primary/25 border border-primary/30 rounded-xl overflow-hidden"
                  >
                    <button
                      className="flex gap-2 text-start cursor-pointer"
                      onClick={() => renderItineraryOnClick(itinerary)}
                    >
                      {itinerary.status === "completed" ? (
                        <CheckCircle
                          strokeWidth={1.5}
                          size={24}
                          className="flex-none text-success"
                          aria-label={`Itinerary ${ITINERARY_STATUS_TEXT[status]}`}
                        />
                      ) : itinerary.status === "in_progress" ? (
                        <CircleFadingArrowUp
                          strokeWidth={1.5}
                          size={24}
                          className="flex-none text-warning"
                          aria-label={`Itinerary ${ITINERARY_STATUS_TEXT[status]}`}
                        />
                      ) : (
                        <CircleMinus
                          strokeWidth={1.5}
                          size={24}
                          className="flex-none text-body-dark"
                          aria-label={`Itinerary ${ITINERARY_STATUS_TEXT[status]}`}
                        />
                      )}

                      <div className="flex flex-col gap-3 text-dark-base">
                        <h3
                          className="text-small-medium text-dark-base line-clamp-2"
                          title={`Matched to: ${prompt}`}
                        >
                          Matched to: {prompt}
                        </h3>
                        <div className="flex justify-between items-end gap-5 w-full">
                          <p className="flex gap-1 items-center">
                            <MapPin size={16} strokeWidth={1.5} />
                            {destination}
                          </p>

                          <p className="flex gap-1 items-center">
                            <ClockIcon size={16} strokeWidth={1.5} />
                            {durationValue} {durationUnit}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      className="group h-fit cursor-pointer"
                      onClick={() => deleteItinerary(itineraryId)}
                      disabled={!!deleting}
                    >
                      {deleting === itineraryId ? (
                        <LoaderCircle size={20} className="animate-spin" />
                      ) : (
                        <TrashIcon
                          size={20}
                          className="flex flex-none text-secondary group-hover:text-error"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-72.5 gap-3">
            <h3 className="text-body-medium">No saved itineraries</h3>
            <p className="text-small">
              Click on the heart icon above an itinerary to save it.
            </p>
            <HeartPlus size={28} className="text-secondary" />
          </div>
        )}

        {error && (
          <p className="text-small-medium text-center text-error">{error}</p>
        )}

        <button
          className="group primary-cta w-full cursor-pointer disabled:opacity-60"
          onClick={renderForm}
          disabled={isLoading}
        >
          <span className="primary-cta-inner w-full px-5 py-2 text-sm md:text-lg">
            New Itinerary
          </span>
        </button>
        {currentItinerary && (
          <button
            onClick={() => updateScreen("itinerary")}
            disabled={isLoading}
            className="w-fit text-sm md:text-lg text-button text-secondary active:translate-y-1 transition-all duration-500 hover:text-dark-base cursor-pointer disabled:opacity-60"
          >
            Current itinerary
          </button>
        )}
      </div>
    </Layout>
  );
}
