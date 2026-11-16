import { createContext, useContext, useState, type ReactNode } from "react";

interface TriageState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const TriageCtx = createContext<TriageState | null>(null);

export function TriageProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <TriageCtx.Provider value={{ open, setOpen }}>{children}</TriageCtx.Provider>;
}

export function useTriage(): TriageState {
  const ctx = useContext(TriageCtx);
  if (!ctx) throw new Error("useTriage must be used within TriageProvider");
  return ctx;
}
