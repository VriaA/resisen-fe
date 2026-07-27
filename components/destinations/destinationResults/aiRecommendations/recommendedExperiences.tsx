import { Sparkles } from "lucide-react";
import ExperienceCard from "@/components/experiences/experienceCard";
import type { Experience } from "@/lib/types/resisen";

export default function RecommendedExperiences({
  recommended,
  prompt,
}: {
  recommended: Experience[];
  prompt: string | undefined;
}) {
  return (
    <section className="w-full border border-primary p-3 rounded-[28px] bg-primary-50">
      <div className="flex w-full h-full flex-col gap-5 rounded-[22px] bg-[url(/gradient_bg.svg)] bg-cover bg-center border border-primary p-6 lg:p-8">
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
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] xl:grid-cols-3">
          {recommended.map((experience) => (
            <ExperienceCard
              key={experience.experienceId}
              experience={experience}
              highlighted
            />
          ))}
        </div>
      </div>
    </section>
  );
}
