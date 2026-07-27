"use client";

import { Check, ImageIcon, LoaderCircle, LockIcon } from "lucide-react";
import { useState } from "react";
import { ItinerariesApi } from "@/lib/api-client";
import type {
  Itinerary,
  ItineraryCheckpoint,
  SavedItineraries,
} from "@/lib/types/resisen";

export default function CheckpointDetails({
  checkpoint,
  isRight,
  isDisabled,
  currentItinerary,
  setError,
  setIsLoading,
  updateItinerary,
  setSavedItineraries,
}: {
  checkpoint: ItineraryCheckpoint;
  isRight: boolean;
  isDisabled: boolean;
  currentItinerary: Itinerary;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  updateItinerary: (itinerary: Itinerary | null) => void;
  setSavedItineraries: React.Dispatch<
    React.SetStateAction<SavedItineraries | null>
  >;
}) {
  const [completing, setCompleting] = useState<string | null>(null);
  const canComplete =
    currentItinerary.status === "in_progress" && checkpoint.status === "active";

  async function completeCheckpoint(checkpointId: string) {
    setIsLoading(true);
    setError(null);
    setCompleting(checkpointId);
    try {
      const updatedItinerary = await ItinerariesApi.completeCheckpoint(
        currentItinerary.itineraryId,
        checkpointId,
      );
      updateItinerary(updatedItinerary);

      setSavedItineraries(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setCompleting(null);
    }
  }

  return (
    <div className="relative w-full h-full">
      {canComplete && (
        <button
          type="button"
          aria-label="Complete checkpoint"
          title="Complete checkpoint"
          className="absolute right-1.5 top-1.5 flex p-0.75 items-center justify-center rounded-full bg-primary-50/40 border border-body-off/50 hover:bg-primary-50 duration-500 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed z-30"
          disabled={isDisabled}
          onClick={() => completeCheckpoint(checkpoint.checkpointId)}
        >
          {completing === checkpoint.checkpointId ? (
            <LoaderCircle size={16} className="text-black animate-spin" />
          ) : (
            <Check size={16} className="text-black" aria-hidden={true} />
          )}
        </button>
      )}

      {checkpoint.status === "completed" && (
        <div className="absolute right-1.5 top-1.5 flex p-0.75 items-center justify-center rounded-full bg-success border border-success/50 duration-500 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed z-30">
          <Check size={16} className=" text-white" />
        </div>
      )}

      <div className="relative w-full h-20">
        {currentItinerary.status === "in_progress" &&
          checkpoint.status === "locked" && (
            <>
              <div className="absolute inset-0 mx-auto w-full h-full bg-dark-base/10 backdrop-blur-xs z-10 rounded-lg" />
              <LockIcon
                size={28}
                className="absolute inset-0 m-auto text-body-off z-20"
              />
            </>
          )}
        {checkpoint.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={checkpoint.imageUrl}
            alt={checkpoint.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="grid place-content-center w-full h-full rounded-lg bg-primary">
            <ImageIcon size={16} className="text-body-dark" />
          </div>
        )}
      </div>

      <h3 className="flex-none mt-2 line-clamp-2 text-small-medium text-dark-base w-fit">
        {checkpoint.title}
      </h3>
      <div
        className={`absolute inset-0 ${isRight ? "mr-auto -ml-6" : "ml-auto -mr-6"}  my-auto flex-none w-2 h-2 rounded-full bg-dark-base`}
      ></div>
    </div>
  );
}
