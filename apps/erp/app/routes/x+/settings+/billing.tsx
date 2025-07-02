import { requirePermissions } from "@carbon/auth/auth.server";
import { STRIPE_PUBLISHABLE_KEY } from "@carbon/auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  VStack,
  toast,
} from "@carbon/react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@vercel/remix";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { 
  getCompanyPlan, 
  getCompanyUsage, 
  getPlanTemplates,
  createSetupIntent 
} from "~/modules/billing";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {
    view: "settings",
  });

  const [companyPlan, companyUsage, planTemplates] = await Promise.all([
    getCompanyPlan(client, companyId),
    getCompanyUsage(client, companyId),
    getPlanTemplates(client),
  ]);

  // Check if user is the owner
  const { data: company } = await client
    .from("company")
    .select("ownerId")
    .eq("id", companyId)
    .single();

  const isOwner = company?.ownerId === userId;

  return json({
    companyPlan: companyPlan.data,
    companyUsage: companyUsage.data,
    planTemplates: planTemplates.data || [],
    isOwner,
    stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {
    update: "settings",
  });

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Check if user is the owner
  const { data: company } = await client
    .from("company")
    .select("ownerId")
    .eq("id", companyId)
    .single();

  if (company?.ownerId !== userId) {
    throw new Error("Only the company owner can manage billing");
  }

  const companyPlan = await getCompanyPlan(client, companyId);
  if (!companyPlan.data?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  switch (intent) {
    case "setup-payment-method": {
      try {
        const setupIntent = await createSetupIntent({
          customer: companyPlan.data.stripeCustomerId,
          usage: "off_session",
          metadata: {
            companyId,
            userId,
          },
        });

        return json({ 
          success: true, 
          clientSecret: setupIntent.client_secret 
        });
      } catch (error) {
        console.error("Setup intent error:", error);
        return json({ 
          success: false, 
          error: "Failed to create setup intent" 
        }, { status: 500 });
      }
    }
    default:
      return json({ success: false, error: "Unknown intent" }, { status: 400 });
  }
}

export default function BillingSettings() {
  const { 
    companyPlan, 
    companyUsage, 
    planTemplates, 
    isOwner, 
    stripePublishableKey 
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const currentPlan = planTemplates.find(p => p.id === companyPlan?.planTemplateId);

  const handleSetupPaymentMethod = async () => {
    if (!stripePublishableKey) {
      toast.error("Stripe is not configured");
      return;
    }

    const stripe = await loadStripe(stripePublishableKey);
    if (!stripe) {
      toast.error("Failed to load Stripe");
      return;
    }

    fetcher.submit(
      { intent: "setup-payment-method" },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.clientSecret) {
      const confirmSetup = async () => {
        const stripe = await loadStripe(stripePublishableKey!);
        if (!stripe) return;

        const { error } = await stripe.confirmCardSetup(fetcher.data.clientSecret);
        if (error) {
          toast.error(error.message || "Failed to setup payment method");
        } else {
          toast.success("Payment method added successfully");
          // Refresh the page to show updated payment methods
          window.location.reload();
        }
      };
      confirmSetup();
    } else if (fetcher.data?.success === false) {
      toast.error(fetcher.data.error || "Something went wrong");
    }
  }, [fetcher.data, stripePublishableKey]);

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            Only the company owner can view and manage billing settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <VStack spacing={6}>
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current subscription and usage details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <VStack spacing={4}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.description}
                  </p>
                </div>
                <div className="text-right">
                  {currentPlan.planType === "Trial" && (
                    <div className="text-lg font-semibold text-green-600">
                      Free Trial
                    </div>
                  )}
                  {currentPlan.planType === "Flat Fee" && currentPlan.flatPrice && (
                    <div className="text-lg font-semibold">
                      ${currentPlan.flatPrice}/month
                    </div>
                  )}
                  {currentPlan.planType === "Per User" && currentPlan.pricePerUser && (
                    <div className="text-lg font-semibold">
                      ${currentPlan.pricePerUser}/user/month
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Status: {companyPlan?.stripeSubscriptionStatus || "Active"}
                  </div>
                </div>
              </div>

              {companyPlan?.trialEndDate && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Trial ends on {new Date(companyPlan.trialEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </VStack>
          ) : (
            <p className="text-muted-foreground">No plan information available</p>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      {companyUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Your current usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Users</div>
                  <div className="text-2xl font-semibold">
                    {companyUsage.users} / {currentPlan?.includedUsers || 0}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (companyUsage.users / (currentPlan?.includedUsers || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Tasks</div>
                  <div className="text-2xl font-semibold">
                    {companyUsage.tasks.toLocaleString()} / {currentPlan?.includedTasks.toLocaleString() || 0}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (companyUsage.tasks / (currentPlan?.includedTasks || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">AI Tokens</div>
                  <div className="text-2xl font-semibold">
                    {companyUsage.aiTokens.toLocaleString()} / {currentPlan?.includedAiTokens.toLocaleString() || 0}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (companyUsage.aiTokens / (currentPlan?.includedAiTokens || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Usage resets on {new Date(companyUsage.nextResetDatetime).toLocaleDateString()}
              </p>
            </VStack>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VStack spacing={4}>
            {currentPlan?.planType !== "Trial" ? (
              <HStack>
                <Button 
                  onClick={handleSetupPaymentMethod}
                  isLoading={fetcher.state === "submitting"}
                >
                  Add Payment Method
                </Button>
              </HStack>
            ) : (
              <p className="text-muted-foreground">
                Payment methods are not required for trial plans
              </p>
            )}
          </VStack>
        </CardContent>
      </Card>

      {/* Plan Management */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Management</CardTitle>
          <CardDescription>
            Upgrade, downgrade, or cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VStack spacing={4}>
            <p className="text-sm text-muted-foreground">
              Contact support to change your plan or cancel your subscription.
            </p>
            <HStack>
              <Button variant="outline">
                Contact Support
              </Button>
            </HStack>
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
}