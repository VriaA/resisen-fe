import { Info } from "lucide-react";

export default function InfoMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full max-w-150 self-center mt-10 flex-col items-center gap-3 rounded-[28px] border border-dashed border-info p-10 text-center">
      <Info size={28} className="text-info" />
      <p className="text-body-regular text-info">{message}</p>
    </div>
  );
}
