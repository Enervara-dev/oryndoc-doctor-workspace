"use client";
import { createContext, useContext } from "react";
import type { Clinic } from "@/lib/types";
export interface WorkspaceContextValue {
  clinic: Clinic;
  email: string;
  userId: string;
  roles: string[];
  permissions: string[];
}
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace context missing");
  return value;
}
