import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="sticky top-5 flex flex-col gap-5 flex-none p-3 md:w-90 h-fit rounded-[28px] border border-primary bg-primary-50/20 overflow-hidden">
      <div className="flex flex-col gap-5 p-5 rounded-[22px] border border-primary bg-primary-50 h-full overflow-hidden">
        {children}
      </div>
    </section>
  );
}
