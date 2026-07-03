import { Sparkles } from "lucide-react";
import ExperienceCard from "@/components/experiences/experienceCard";
import { readRecommendations } from "@/lib/recommendations";

export default function AiRecommendations({ slug }: { slug: string }) {
  const stored = readRecommendations(slug);
  const recommended = stored?.recommended;
  const prompt = stored?.prompt;

  if (!recommended) return null;

  return (
    <>
      {recommended.length > 0 && (
        <div className="border border-primary p-3 rounded-2xl bg-primary-50">
          <div className="flex w-full flex-col gap-5 rounded-[10px] bg-[url(/gradient_bg.svg)] bg-cover bg-center border border-primary p-6 lg:p-8">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-section-title text-white wrap-break-word">
                AI recommendations
                <Sparkles
                  size={40}
                  className="text-white animate-spin"
                  style={{ animationDuration: "20s" }}
                  strokeWidth="1"
                />
              </h2>
              <p className="text-body-regular text-body-light">
                {prompt
                  ? `Matched to: “${prompt}”`
                  : "AI-curated picks based on what you told us about your trip."}
              </p>
            </div>
            <div className="card-result-grid">
              {recommended.map((experience) => (
                <ExperienceCard
                  key={experience.experienceId}
                  experience={experience}
                  highlighted
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
