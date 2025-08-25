import type { IntegrationConfig } from "@carbon/ee";
import { SearchFilter } from "~/components";
import { useUrlParams } from "~/hooks";
import { IntegrationCard } from "./IntegrationCard";

type IntegrationsListProps = {
  availableIntegrations: IntegrationConfig[];
  installedIntegrations: string[];
};

const IntegrationsList = ({
  installedIntegrations,
  availableIntegrations
}: IntegrationsListProps) => {
  const [params] = useUrlParams();
  const search = params.get("search") || "";
  if (search) {
    availableIntegrations = availableIntegrations.filter((integration) =>
      integration.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 pt-4 px-4">
        <div>
          <SearchFilter param="search" size="sm" placeholder="Search" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-4 px-4 w-full">
        {availableIntegrations.map((integration) => {
          return (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              installed={installedIntegrations.includes(integration.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationsList;
