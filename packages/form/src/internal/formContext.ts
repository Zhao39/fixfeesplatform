import { createContext } from "react";
import type { FetcherWithComponents } from "react-router";

export type InternalFormContextValue = {
  formId: string | symbol;
  action?: string;
  subaction?: string;
  defaultValuesProp?: { [fieldName: string]: any };
  fetcher?: FetcherWithComponents<unknown>;
};

export const InternalFormContext =
  createContext<InternalFormContextValue | null>(null);
