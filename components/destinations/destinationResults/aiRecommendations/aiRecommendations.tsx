import { useContext } from "react";
import { destinationContext } from "@/lib/contexts/DestinationContext";
import { readRecommendations } from "@/lib/recommendations";
import ItineraryLanding from "./itineraries/itineraryLanding";
import RecommendedExperiences from "./recommendedExperiences";
import type { DestinationContext } from "@/lib/contexts/DestinationContext";

export default function AiRecommendations() {
  const { slug } = useContext(destinationContext) as DestinationContext;
  const stored = readRecommendations(slug);
  const recommended = stored?.recommended;
  const prompt = stored?.prompt;

  if (!recommended) return null;

  return (
    <>
      {recommended.length > 0 && (
        <div className="flex flex-col md:flex-row gap-5">
          <RecommendedExperiences recommended={recommended} prompt={prompt} />
          <ItineraryLanding recommended={recommended} prompt={prompt} />
        </div>
      )}
    </>
  );
}
