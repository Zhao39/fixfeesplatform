import { TooltipProvider, useMount } from "@carbon/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";

import {
  CarbonProvider,
  CONTROLLED_ENVIRONMENT,
  getAppUrl,
  getCarbon,
  getCompanies,
  getUser,
} from "@carbon/auth";
import {
  destroyAuthSession,
  requireAuthSession,
} from "@carbon/auth/session.server";
import { getUserClaims, getUserDefaults } from "@carbon/auth/users.server";
import {
  AcademyBanner,
  ItarPopup,
  useKeyboardWedgeNavigation,
  useNProgress,
} from "@carbon/remix";
import posthog from "posthog-js";
import RealtimeDataProvider from "~/components/RealtimeDataProvider";
import Topbar from "~/components/Topbar";
import { path } from "~/utils/path";

export async function loader({ request }: LoaderFunctionArgs) {
  const { accessToken, companyId, expiresAt, expiresIn, userId } =
    await requireAuthSession(request, { verify: true });

  // share a client between requests
  const client = getCarbon(accessToken);

  // parallelize the requests
  const [companies, claims, defaults, user] = await Promise.all([
    getCompanies(client, userId),
    getUserClaims(userId, companyId),
    getUserDefaults(client, userId, companyId),
    getUser(client, userId),
  ]);

  if (user.error || !user.data) {
    await destroyAuthSession(request);
  }

  const company = companies.data?.find((c) => c.companyId === companyId);
  if (!company) {
    throw redirect(getAppUrl());
  }

  return json({
    session: {
      accessToken,
      expiresIn,
      expiresAt,
    },
    company,
    companies: companies.data ?? [],
    defaults: defaults.data,
    permissions: claims?.permissions,
    role: claims?.role,
    user: user.data,
  });
}

export default function AuthenticatedRoute() {
  const { session, user } = useLoaderData<typeof loader>();

  useNProgress();
  useKeyboardWedgeNavigation();

  useMount(() => {
    if (!user) return;

    posthog.identify(user.id, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  });

  return (
    <div className="h-[100dvh] flex flex-col">
      {user?.acknowledgedITAR === false && CONTROLLED_ENVIRONMENT ? (
        <ItarPopup
          acknowledgeAction={path.to.acknowledge}
          logoutAction={path.to.logout}
        />
      ) : (
        <CarbonProvider session={session}>
          <RealtimeDataProvider>
            <TooltipProvider>
              <div className="flex flex-col h-screen">
                {user?.acknowledgedUniversity ? null : (
                  <AcademyBanner acknowledgeAction={path.to.acknowledge} />
                )}

                <Topbar />
                <div className="flex flex-1 h-[calc(100vh-49px)] relative">
                  <main className="flex-1 overflow-y-auto scrollbar-hide border-l border-t bg-background relative z-10">
                    <Outlet />
                  </main>
                </div>
              </div>
            </TooltipProvider>
          </RealtimeDataProvider>
        </CarbonProvider>
      )}
    </div>
  );
}
