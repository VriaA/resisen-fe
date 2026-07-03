import { Destination } from "@/lib/types/reisen";
import { MapPin } from "lucide-react";

export default function Hero({
  destination,
}: {
  destination: Destination | null;
}) {
  return (
    <div className="relative flex min-h-80 w-full flex-col justify-end gap-4 overflow-hidden rounded-[28px] bg-dark-base p-5 lg:p-10">
      {destination?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-primary-50" />
      )}

      <div className="absolute inset-0 bg-black/40" />

      <h1 className="relative z-10 flex items-center gap-2 text-section-title text-white-base">
        <MapPin size={28} className="shrink-0" />
        {destination
          ? `${destination.name}, ${destination.country}`
          : "Destination"}
      </h1>

      {destination?.description && (
        <p className="relative z-10 max-w-200 text-body-regular text-body-light">
          {destination.description}
        </p>
      )}
    </div>
  );
}
