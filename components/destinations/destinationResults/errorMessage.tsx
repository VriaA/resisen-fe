import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <div className="flex w-full max-w-150 flex-col items-center self-center gap-3 rounded-[28px] border border-dashed border-error p-10 text-center">
      <AlertTriangle size={28} className="text-error" />
      <p className="text-body-regular text-error">{errorMessage}</p>
    </div>
  );
}
