import { requirePermissions } from "@carbon/auth/auth.server";
import { Onshape as OnshapeConfig } from "@carbon/ee";
import { OnshapeClient } from "@carbon/ee/onshape";
import type {
  LoaderFunctionArgs,
  ShouldRevalidateFunction
} from "react-router";
import { getIntegration } from "~/modules/settings/settings.service";

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const { did } = params;
  if (!did) {
    return {
      data: [],
      error: "Document ID is required"
    };
  }

  const { vid } = params;
  if (!vid) {
    return {
      data: [],
      error: "Version ID is required"
    };
  }

  const integration = await getIntegration(client, "onshape", companyId);

  if (integration.error || !integration.data) {
    return {
      data: [],
      error: integration.error
    };
  }

  const integrationMetadata = OnshapeConfig.schema.safeParse(
    integration?.data?.metadata
  );

  if (!integrationMetadata.success) {
    return {
      data: [],
      error: integrationMetadata.error
    };
  }

  const onshapeClient = new OnshapeClient({
    baseUrl: integrationMetadata.data.baseUrl,
    accessKey: integrationMetadata.data.accessKey,
    secretKey: integrationMetadata.data.secretKey
  });

  try {
    let limit = 20;
    let offset = 0;
    let allDocuments: Array<{ id: string; name: string }> = [];

    while (true && offset < 100) {
      const response = await onshapeClient.getElements(did, vid, limit, offset);

      if (!response || response.length === 0) {
        break;
      }

      allDocuments.push(...response);

      if (response.length < limit) {
        break;
      }

      offset += limit;
    }

    return {
      data: allDocuments,
      error: null
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get versions from Onshape"
    };
  }
}
