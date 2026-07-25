"use client";

import { useState } from "react";
import { Layout } from "./layout";
import { LoaderCircle, Map } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { TripDurationUnit, TripDuration } from "@/lib/types/reisen";

const DURATION_UNITS = {
  hours: { label: "Hours", max: 24 },
  days: { label: "Days", max: 31 },
  weeks: { label: "Weeks", max: 52 },
  months: { label: "Months", max: 12 },
};

const INPUT_CLASS =
  "flex items-center gap-2 filter-border bg-transparent px-2 py-2.5 text-small text-body-dark text-center focus:outline-0 focus:border-secondary";

export default function Form({
  isLoading,
  error,
  genenrateItinerary,
  renderSavedItineraries,
}: {
  isLoading: boolean;
  error: string | null;
  genenrateItinerary: (
    durationValue: number,
    durationUnit: TripDurationUnit,
  ) => Promise<void>;
  renderSavedItineraries: () => Promise<void>;
}) {
  const [duration, setDuration] = useState<TripDuration>({
    value: 2,
    unit: "days",
  });

  function getMaxDuration(unit: TripDurationUnit) {
    return DURATION_UNITS[unit].max;
  }

  function updateDuration(
    newValue: number | TripDurationUnit,
    type: "unit" | "duration",
  ) {
    setDuration((prevDuration) => {
      const newDuration =
        type === "duration" ? (newValue as number) : prevDuration.value;
      const newMaxDuration =
        type === "unit"
          ? getMaxDuration(newValue as TripDurationUnit)
          : getMaxDuration(prevDuration.unit as TripDurationUnit);
      return {
        value:
          newDuration > newMaxDuration
            ? newMaxDuration
            : newDuration < 1
              ? 1
              : newDuration,
        unit:
          type === "unit" ? (newValue as TripDurationUnit) : prevDuration.unit,
      };
    });
  }

  return (
    <Layout>
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center justify-between text-section-inner-title text-dark-base">
          Get a personalised itinerary
          <Map
            size={32}
            strokeWidth={1}
            className="flex-none animate-bounce animation-duration-[5s]"
          />
        </h2>
        <p className="text-body-dark text-body-regular">
          Itineraries are sequenced experiences that are tailored to a
          destination, your interests and trip duration.
        </p>
      </div>

      <form
        className="w-full mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          genenrateItinerary(duration.value, duration.unit);
        }}
      >
        <div className="flex items-end w-full">
          <label
            htmlFor="trip-duration"
            className="flex flex-col gap-1 text-small-medium text-body-dark w-full"
          >
            Trip duration
            <input
              id="duration"
              type="number"
              name="duration"
              min={1}
              max={getMaxDuration(duration.unit)}
              value={duration.value}
              onChange={(e) =>
                updateDuration(Number(e.target.value), "duration")
              }
              className={`${INPUT_CLASS} rounded-r-none border-r-0`}
              disabled={isLoading}
            />
          </label>
          <Select
            value={duration.unit}
            disabled={isLoading}
            name="unit"
            onValueChange={(unit: TripDurationUnit) =>
              updateDuration(unit, "unit")
            }
          >
            <SelectTrigger
              aria-label="Destination"
              className={`${INPUT_CLASS} data-[size=default]:h-auto rounded-2xl rounded-l-none text-body-dark! text-small`}
            >
              {DURATION_UNITS[duration.unit].label}
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="end"
              sideOffset={8}
              className="min-w-56 rounded-2xl border border-body-off bg-white-base p-2 ring-0 shadow-[0px_0px_20px_#7f5ccc55]"
            >
              {Object.entries(DURATION_UNITS).map(([key, value]) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-xl py-2 pr-8 pl-3 focus:bg-primary-50 data-[state=checked]:bg-primary-50"
                >
                  <span className="flex flex-col text-small-medium text-dark-base">
                    {value.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p className="text-small-medium text-center text-error">{error}</p>
        )}
        <button
          className="group w-full primary-cta cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <span className="primary-cta-inner flex justify-center items-center w-full px-5 py-2 text-sm md:text-lg">
            {isLoading ? "Generating..." : "Generate"}
            {isLoading && <LoaderCircle className="animate-spin" />}
          </span>
        </button>
      </form>

      <button
        className="text-button text-secondary active:translate-y-1 transition-all duration-500 hover:text-dark-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isLoading}
        onClick={renderSavedItineraries}
      >
        Saved itineraries
      </button>
    </Layout>
  );
}
