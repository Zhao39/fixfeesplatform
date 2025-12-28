import { requirePermissions } from "@carbon/auth/auth.server";
import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import {
  getLocationsList,
  getMaintenanceSchedulesByLocation
} from "~/modules/resources";
import MaintenanceSchedulesTable from "~/modules/resources/ui/MaintenanceSchedule/MaintenanceSchedulesTable";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";

export const handle: Handle = {
  breadcrumb: "Scheduled Maintenances",
  to: path.to.maintenanceSchedules
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "resources",
    role: "employee"
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const locationId = searchParams.get("location");
  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const locations = await getLocationsList(client, companyId);
  const locationsList = locations.data ?? [];

  // Default to first location if none specified
  const selectedLocationId = locationId ?? locationsList[0]?.id;

  if (!selectedLocationId) {
    return {
      data: [],
      count: 0,
      locations: locationsList,
      locationId: null
    };
  }

  const schedules = await getMaintenanceSchedulesByLocation(
    client,
    companyId,
    selectedLocationId,
    {
      search,
      limit,
      offset,
      sorts,
      filters
    }
  );

  return {
    data: schedules.data ?? [],
    count: schedules.count ?? 0,
    locations: locationsList,
    locationId: selectedLocationId
  };
}

export default function MaintenanceSchedulesRoute() {
  const { data, count, locations, locationId } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <MaintenanceSchedulesTable
        data={data ?? []}
        count={count ?? 0}
        locations={locations}
        locationId={locationId}
      />
      <Outlet />
    </VStack>
  );
}
