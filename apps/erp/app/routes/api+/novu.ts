import { serve } from "@novu/framework/remix";
import {
  assignmentWorkflow,
  digitalQuoteResponseWorkflow,
  expirationWorkflow,
  gaugeCalibrationExpiredWorkflow,
  jobCompletedWorkflow,
  messageWorkflow,
  suggestionResponseWorkflow,
  supplierQuoteResponseWorkflow
} from "~/novu/workflows";

const handler = serve({
  workflows: [
    assignmentWorkflow,
    digitalQuoteResponseWorkflow,
    expirationWorkflow,
    gaugeCalibrationExpiredWorkflow,
    jobCompletedWorkflow,
    messageWorkflow,
    suggestionResponseWorkflow,
    supplierQuoteResponseWorkflow
  ]
});

export { handler as action, handler as loader };
