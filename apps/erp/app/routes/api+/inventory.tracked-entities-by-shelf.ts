import { requirePermissions } from "@carbon/auth/auth.server";
import type { LoaderFunctionArgs } from "react-router";
import { getItemShelfQuantities } from "~/modules/items/items.service";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");
  const shelfId = url.searchParams.get("shelfId");
  const locationId = url.searchParams.get("locationId");

  if (!itemId || !locationId) {
    return {
      data: [],
      error: null
    };
  }

  // Get all tracked entities for the item in the location
  const result = await getItemShelfQuantities(
    client,
    itemId,
    companyId,
    locationId
  );

  if (result.error) {
    return {
      data: [],
      error: result.error
    };
  }

  // Filter to only include entities from the specific shelf
  const shelfEntities =
    result.data?.filter(
      (entity) => entity.shelfId === shelfId && entity.trackedEntityId
    ) || [];

  return {
    data: shelfEntities,
    error: null
  };
}
