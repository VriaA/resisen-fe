import { AlertCircleIcon, AlertTriangle } from "lucide-react";

export default function StateMessage({
  type,
  children,
}: {
  type: "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center w-full max-w-160 h-fit mx-auto">
      {type === "error" ? (
        <AlertTriangle size={40} className="text-error" />
      ) : (
        <AlertCircleIcon size={40} className="text-info" />
      )}
      <p
        className={`text-body-regular ${type === "error" ? "text-error" : "text-body-dark"}`}
      >
        {children}
      </p>
    </div>
  );
}
