import { useMount } from "@carbon/react";
import { useFetcher } from "react-router";
import { path } from "~/utils/path";

type SwaggerDocsSchema = {
  paths: Record<string, any>;
  definitions: Record<string, any>;
};

export const useSwaggerDocs = () => {
  const docsFetcher = useFetcher<SwaggerDocsSchema>();

  useMount(() => {
    docsFetcher.load(path.to.api.docs);
  });

  return docsFetcher.data;
};
