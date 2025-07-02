import { requirePermissions } from "@carbon/auth/auth.server";
import { ValidatedForm, validationError, validator } from "@carbon/form";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  HStack,
} from "@carbon/react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, redirect, type ActionFunctionArgs } from "@vercel/remix";
import { z } from "zod";
import { Hidden, Submit } from "~/components/Form";
import { useOnboarding } from "~/hooks";
import { getPlanTemplates } from "~/modules/billing";

const planSelectionValidator = z.object({
  planTemplateId: z.string().min(1, { message: "Please select a plan" }),
  next: z.string(),
});

export async function loader({ request }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    update: "settings",
  });

  const plans = await getPlanTemplates(client);

  if (plans.error || !plans.data) {
    return json({
      plans: [],
    });
  }

  return json({ plans: plans.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const validation = await validator(planSelectionValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { next, planTemplateId } = validation.data;

  // Store the selected plan in session or localStorage
  // For now, we'll pass it as a query parameter to the next step
  const nextUrl = new URL(next, request.url);
  nextUrl.searchParams.set("planTemplateId", planTemplateId);

  throw redirect(nextUrl.toString());
}

export default function OnboardingPlan() {
  const { plans } = useLoaderData<typeof loader>();
  const { next, previous } = useOnboarding();

  return (
    <Card className="max-w-4xl">
      <ValidatedForm
        validator={planSelectionValidator}
        defaultValues={{ next }}
        method="post"
      >
        <CardHeader>
          <CardTitle>Choose your plan</CardTitle>
          <p className="text-muted-foreground">
            Select the plan that best fits your needs. You can change or cancel
            anytime.
          </p>
        </CardHeader>
        <CardContent>
          <Hidden name="next" value={next} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className="relative flex flex-col p-6 border rounded-lg cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-accent/5"
              >
                <input
                  type="radio"
                  name="planTemplateId"
                  value={plan.id}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.planType === "Trial" && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Free Trial
                    </span>
                  )}
                </div>

                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                )}

                <div className="mb-4">
                  {plan.planType === "Trial" && (
                    <div className="text-2xl font-bold">
                      Free
                      {plan.trialDays && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          for {plan.trialDays} days
                        </span>
                      )}
                    </div>
                  )}
                  {plan.planType === "Flat Fee" && plan.flatPrice && (
                    <div className="text-2xl font-bold">
                      ${plan.flatPrice}
                      <span className="text-sm font-normal text-muted-foreground">
                        /month
                      </span>
                    </div>
                  )}
                  {plan.planType === "Per User" && plan.pricePerUser && (
                    <div className="text-2xl font-bold">
                      ${plan.pricePerUser}
                      <span className="text-sm font-normal text-muted-foreground">
                        /user/month
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Users included:
                    </span>
                    <span>{plan.includedUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span>{plan.includedTasks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI Tokens:</span>
                    <span>{plan.includedAiTokens.toLocaleString()}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:after:content-[''] has-[:checked]:after:block has-[:checked]:after:w-2 has-[:checked]:after:h-2 has-[:checked]:after:bg-white has-[:checked]:after:rounded-full has-[:checked]:after:m-auto"></div>
                </div>
              </label>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No plans are available at the moment. Please contact support.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <HStack>
            <Button
              variant="solid"
              isDisabled={!previous}
              size="md"
              asChild
              tabIndex={-1}
            >
              <Link to={previous} prefetch="intent">
                Previous
              </Link>
            </Button>
            <Submit isDisabled={plans.length === 0}>Continue</Submit>
          </HStack>
        </CardFooter>
      </ValidatedForm>
    </Card>
  );
}
