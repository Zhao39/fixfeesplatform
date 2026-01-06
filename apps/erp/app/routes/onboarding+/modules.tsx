import { assertIsPost } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { ValidatedForm, validationError, validator } from "@carbon/form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  HStack,
  VStack
} from "@carbon/react";
import {
  type ActionFunctionArgs,
  Link,
  redirect,
  useLoaderData
} from "react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Hidden, Submit, TextArea } from "~/components/Form";
import { useOnboarding } from "~/hooks";
import { getCompany, updateCompany } from "~/modules/settings";
import { setOnboardingDraft } from "~/services/onboarding-draft.server";

const onboardingModulesValidator = z.object({
  isSalesEnabled: zfd.checkbox(),
  isPurchasingEnabled: zfd.checkbox(),
  isPartsEnabled: zfd.checkbox(),
  isInventoryEnabled: zfd.checkbox(),
  featureRequests: zfd.text(z.string().optional()),
  seedDemoData: zfd.checkbox(),
  next: zfd.text(z.string().min(1, { message: "Next is required" }))
});

export async function loader({ request }: ActionFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const company = await getCompany(client, companyId);

  if (company.error || !company.data) {
    return {
      company: null
    };
  }

  return { company: company.data };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId, companyId } = await requirePermissions(request, {});

  const validation = await validator(onboardingModulesValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const {
    next,
    isSalesEnabled,
    isPurchasingEnabled,
    isPartsEnabled,
    isInventoryEnabled,
    featureRequests,
    seedDemoData
  } = validation.data;

  // Store module selection in session draft
  const draftCookie = await setOnboardingDraft(request, {
    modules: {
      isSalesEnabled,
      isPurchasingEnabled,
      isPartsEnabled,
      isInventoryEnabled,
      featureRequests: featureRequests ?? undefined,
      seedDemoData: seedDemoData ?? false
    }
  });

  // Store module selection, feature requests, and demo data preference in company
  const updateResult = await updateCompany(client, companyId, {
    selectedModules: [
      isSalesEnabled ? "Sales" : null,
      isPurchasingEnabled ? "Purchasing" : null,
      isPartsEnabled ? "Parts" : null,
      isInventoryEnabled ? "Inventory" : null
    ].filter(Boolean) as string[],
    featureRequests: featureRequests ?? "",
    seedDemoData: seedDemoData ?? false,
    updatedBy: userId
  });

  if (updateResult.error) {
    console.error(updateResult.error);
    return validationError({
      fieldErrors: {
        modules: "Failed to save module selection"
      }
    });
  }

  throw redirect(next, {
    headers: [["Set-Cookie", draftCookie]]
  });
}

export default function OnboardingModules() {
  const { company } = useLoaderData<typeof loader>();
  const { next, previous } = useOnboarding();

  const selectedModules = (company?.selectedModules as string[]) ?? [];

  const initialValues = {
    isSalesEnabled: selectedModules.includes("Sales"),
    isPurchasingEnabled: selectedModules.includes("Purchasing"),
    isPartsEnabled: selectedModules.includes("Parts"),
    isInventoryEnabled: selectedModules.includes("Inventory"),
    featureRequests: company?.featureRequests ?? "",
    seedDemoData: company?.seedDemoData ?? false
  };

  return (
    <Card className="max-w-2xl">
      <ValidatedForm
        validator={onboardingModulesValidator}
        defaultValues={initialValues}
        method="post"
      >
        <CardHeader>
          <CardTitle>What do you need help with?</CardTitle>
          <CardDescription>
            Select the areas where you need Carbon to help streamline your
            operations. You can always enable more modules later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Hidden name="next" value={next} />
          <VStack spacing={4}>
            <HStack>
              <Checkbox id="isSalesEnabled" name="isSalesEnabled" />
              <label htmlFor="isSalesEnabled">Sales</label>
            </HStack>

            <HStack>
              <Checkbox id="isPurchasingEnabled" name="isPurchasingEnabled" />
              <label htmlFor="isPurchasingEnabled">Purchasing</label>
            </HStack>
            <HStack>
              <Checkbox id="isPartsEnabled" name="isPartsEnabled" />
              <label htmlFor="isPartsEnabled">Parts</label>
            </HStack>
            <HStack>
              <Checkbox id="isInventoryEnabled" name="isInventoryEnabled" />
              <label htmlFor="isInventoryEnabled">Inventory</label>
            </HStack>
            <TextArea
              name="featureRequests"
              label="What features or capabilities are you looking for?"
              placeholder="Tell us about specific features, integrations, or workflows you need..."
              rows={3}
            />
            <HStack>
              <Checkbox id="seedDemoData" name="seedDemoData" />
              <label htmlFor="seedDemoData">Create demo data for me</label>
            </HStack>
          </VStack>
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
            <Submit>Next</Submit>
          </HStack>
        </CardFooter>
      </ValidatedForm>
    </Card>
  );
}
