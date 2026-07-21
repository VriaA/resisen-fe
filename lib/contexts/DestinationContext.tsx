"use client";

import { createContext, ReactNode } from "react";

export interface DestinationContext {
  slug: string;
}

export const destinationContext = createContext<DestinationContext | null>(
  null,
);

export default function DestinationContextProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <destinationContext.Provider value={{ slug }}>
      {children}
    </destinationContext.Provider>
  );
}
