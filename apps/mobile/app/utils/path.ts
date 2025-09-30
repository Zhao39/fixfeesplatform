import { getAppUrl, SUPABASE_URL } from "@carbon/auth";
import { generatePath } from "@remix-run/react";

const x = "/x"; // from ~/routes/x+ folder

const ERP_URL = getAppUrl();

export const path = {
  to: {
    acknowledge: `${x}/acknowledge`,
    build: `${x}/build`,
    authenticatedRoot: x,
    accountSettings: `${ERP_URL}/x/account`,
    callback: "/callback",
    companySwitch: (companyId: string) =>
      generatePath(`${x}/company/switch/${companyId}`),
    count: `${x}/count`,
    feedback: `${x}/feedback`,
    health: "/health",
    login: "/login",
    logout: "/logout",
    onboarding: `${ERP_URL}/onboarding`,
    pick: `${x}/pick`,
    quality: `${x}/quality`,
    qualityNew: `${x}/quality/new`,
    qualityOpen: `${x}/quality/open`,
    qualityPast: `${x}/quality/past`,
    receive: `${x}/receive`,
    receiveNew: `${x}/receive/new`,
    receiveOpen: `${x}/receive/open`,
    receivePast: `${x}/receive/past`,
    refreshSession: "/refresh-session",
    requestAccess: "/request-access",
    root: "/",
    ship: `${x}/ship`,
    shipNew: `${x}/ship/new`,
    shipOpen: `${x}/ship/open`,
    shipPast: `${x}/ship/past`,
    transfer: `${x}/transfer`,
  },
} as const;

export const removeSubdomain = (url?: string): string => {
  if (!url) return "localhost:3000";
  const parts = url.split("/")[0].split(".");

  const domain = parts.slice(-2).join(".");

  return domain;
};

export const getStoragePath = (bucket: string, path: string) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

export const requestReferrer = (request: Request) => {
  return request.headers.get("referer");
};

export const getParams = (request: Request) => {
  const url = new URL(requestReferrer(request) ?? "");
  const searchParams = new URLSearchParams(url.search);
  return searchParams.toString();
};
