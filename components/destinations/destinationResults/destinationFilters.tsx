"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destinationsApi } from "@/lib/api-client";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Destination, ExperienceCategory } from "@/lib/types/reisen";

export type DestinationFilterState = {
  search: string;
  minPrice: string;
  maxPrice: string;
  categories: ExperienceCategory[];
};

const CATEGORY_LABELS: Record<ExperienceCategory, string> = {
  adventure: "Adventure",
  cultural: "Culture",
  nightlife: "Nightlife",
  relaxation: "Relaxation",
  wildlife: "Wildlife",
  water_sports: "Water Sports",
  romantic: "Romantic",
  family_friendly: "Family",
};

const CATEGORY_OPTIONS = (
  Object.keys(CATEGORY_LABELS) as ExperienceCategory[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }));

const PILL =
  "flex items-center gap-2 filter-border bg-transparent px-4 py-2.5 text-small text-body-dark";

export default function DestinationFilters({
  filters,
  onChange,
  currentSlug,
  currentName,
}: {
  filters: DestinationFilterState;
  onChange: (next: Partial<DestinationFilterState>) => void;
  currentSlug: string;
  currentName: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{
    hasError: boolean;
    errorMessage: string;
    isLoading: boolean;
  }>({ hasError: false, errorMessage: "", isLoading: false });
  const [destinations, setDestinations] = useState<Destination[]>([]);

  const { search, minPrice, maxPrice, categories } = filters;

  useEffect(() => {
    async function getDestinations() {
      setStatus({
        hasError: false,
        errorMessage: "",
        isLoading: true,
      });

      try {
        const destinations = await destinationsApi.list({ limit: 50 });
        setDestinations(() => destinations.items);
      } catch (error: unknown) {
        setStatus({
          hasError: true,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Something went wrong, try again.",
          isLoading: false,
        });
      } finally {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    }
    getDestinations();
  }, []);

  function toggleCategory(value: ExperienceCategory) {
    onChange({
      categories: categories.includes(value)
        ? categories.filter((c) => c !== value)
        : [...categories, value],
    });
  }

  const categoryLabel =
    categories.length === 0
      ? "Category"
      : categories.length === 1
        ? CATEGORY_OPTIONS.find((c) => c.value === categories[0])?.label
        : `Category (${categories.length})`;

  return (
    <div className="grid w-full grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center">
      {/* SEARCH */}
      <div
        className={`${PILL} col-span-2 w-full focus-within:border-secondary lg:order-3 lg:mx-auto lg:w-100 lg:min-w-50 lg:max-w-100`}
      >
        <input
          aria-label="Search"
          type="search"
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search..."
          className="w-full bg-transparent text-dark-base outline-none placeholder:text-body-dark [&::-webkit-search-cancel-button]:appearance-none"
        />
        <Search size={20} className="shrink-0 text-secondary" />
      </div>

      {/* MIN/MAX PRICE */}
      <input
        aria-label="Min price"
        type="number"
        inputMode="numeric"
        min={0}
        value={minPrice}
        onChange={(e) => onChange({ minPrice: e.target.value })}
        placeholder="Min price"
        className={`${PILL} w-full text-dark-base outline-none placeholder:text-body-dark focus:border-secondary lg:order-1 lg:w-32 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <input
        aria-label="Max price"
        type="number"
        inputMode="numeric"
        min={0}
        value={maxPrice}
        onChange={(e) => onChange({ maxPrice: e.target.value })}
        placeholder="Max price"
        className={`${PILL} w-full text-dark-base outline-none placeholder:text-body-dark focus:border-secondary lg:order-2 lg:w-32 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
      />

      {/* DESTINATION SWITCHER — navigates to the chosen destination's page */}
      <Select
        value={currentSlug}
        onValueChange={(slug) => {
          if (slug !== currentSlug) {
            router.push(`/experiences/destination/${slug}`);
          }
        }}
      >
        <SelectTrigger
          aria-label="Destination"
          className={`${PILL} w-full justify-start rounded-2xl border-body-dark/20 text-(length:--small-font-size) data-[size=default]:h-auto lg:order-4 lg:w-auto [&>svg]:shrink-0 [&>svg]:text-secondary`}
        >
          <MapPin size={20} />
          <span className="max-w-32 truncate text-dark-base text-small">
            {currentName || "Destination"}
          </span>
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="end"
          sideOffset={8}
          className="min-w-56 rounded-2xl border border-body-off bg-white-base p-2 ring-0 shadow-[0px_0px_20px_#7f5ccc55]"
        >
          {status.hasError ? (
            <div className="px-3 py-2 text-small text-error">
              {status.errorMessage}
            </div>
          ) : destinations.length === 0 ? (
            <div className="px-3 py-2 text-small text-body-dark">
              No destinations available.
            </div>
          ) : (
            destinations.map((dest) => (
              <SelectItem
                key={dest.slug}
                value={dest.slug}
                className="rounded-xl py-2 pr-8 pl-3 focus:bg-primary-50 data-[state=checked]:bg-primary-50"
              >
                <span className="flex flex-col">
                  <span className="text-small-medium text-dark-base">
                    {dest.name}
                  </span>
                  <span className="text-extra-small text-body-dark">
                    {dest.country}
                  </span>
                </span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Category multi-select */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Category"
          className={`${PILL} w-full justify-start rounded-2xl border-body-dark/20 outline-none lg:order-5 lg:w-auto`}
        >
          <SlidersHorizontal size={20} className="shrink-0 text-secondary" />
          <span className="text-dark-base text-small">{categoryLabel}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          avoidCollisions={false}
          className="min-w-56 rounded-2xl border border-body-off bg-white-base p-2 shadow-[0px_0px_20px_#7f5ccc55]"
        >
          <DropdownMenuCheckboxItem
            checked={categories.length === 0}
            onCheckedChange={() => onChange({ categories: [] })}
            onSelect={(event) => event.preventDefault()}
            className="rounded-xl py-2 pr-8 pl-3 text-dark-base focus:bg-primary-50"
          >
            All
          </DropdownMenuCheckboxItem>
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={categories.includes(value)}
              onCheckedChange={() => toggleCategory(value)}
              onSelect={(event) => event.preventDefault()}
              className="rounded-xl py-2 pr-8 pl-3 text-dark-base focus:bg-primary-50"
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
