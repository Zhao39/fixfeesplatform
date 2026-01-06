import { assertIsPost } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { industries, industryInfo } from "@carbon/database/seed/demo";
import { ValidatedForm, validationError, validator } from "@carbon/form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Hidden, RadioGroup, Submit, TextArea } from "~/components/Form";
import { useOnboarding } from "~/hooks";
import {
  getCompany,
  onboardingIndustryTypes,
  updateCompany
} from "~/modules/settings";
import { setOnboardingDraft } from "~/services/onboarding-draft.server";

const onboardingIndustryValidator = z.object({
  industryId: z.enum(onboardingIndustryTypes, {
    errorMap: () => ({ message: "Please select an industry type" })
  }),
  customIndustryDescription: z.string().optional(),
  next: z.string()
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

  const validation = await validator(onboardingIndustryValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { next, industryId, customIndustryDescription } = validation.data;

  // Store industry selection in session draft
  const draftCookie = await setOnboardingDraft(request, {
    industry: {
      industryId,
      customIndustryDescription:
        industryId === "custom" ? customIndustryDescription : undefined
    }
  });

  // Store industry selection in company
  const updateResult = await updateCompany(client, companyId, {
    industryId: industryId as any,
    customIndustryDescription:
      industryId === "custom" ? customIndustryDescription || null : null,
    updatedBy: userId
  } as any);

  if (updateResult.error) {
    console.error(updateResult.error);
    return validationError({
      fieldErrors: {
        customIndustryDescription: "Failed to save industry selection"
      }
    });
  }

  throw redirect(next, {
    headers: [["Set-Cookie", draftCookie]]
  });
}

export default function OnboardingIndustry() {
  const { company } = useLoaderData<typeof loader>();
  const { next, previous } = useOnboarding();

  const industryOptions = [
    ...industries.map((id) => ({
      value: id,
      label: industryInfo[id].name,
      description: industryInfo[id].description
    })),
    {
      value: "custom",
      label: "Other",
      description: "Describe your organization type"
    }
  ];

  const validIndustryIds = [
    "robotics_oem",
    "cnc_aerospace",
    "metal_fabrication",
    "automotive_precision",
    "custom"
  ] as const;

  type ValidIndustryId = (typeof validIndustryIds)[number];

  const initialValues = {
    industryId:
      company?.industryId &&
      validIndustryIds.includes(company.industryId as any)
        ? (company.industryId as ValidIndustryId)
        : undefined,
    customIndustryDescription: company?.customIndustryDescription ?? ""
  };

  return (
    <Card className="max-w-2xl">
      <ValidatedForm
        validator={onboardingIndustryValidator}
        defaultValues={initialValues}
        method="post"
      >
        <CardHeader>
          <CardTitle>What type of organization are you?</CardTitle>
          <CardDescription>
            This helps us customize your experience with relevant features and
            demo data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Hidden name="next" value={next} />
          <VStack spacing={4}>
            <RadioGroup
              name="industryId"
              options={industryOptions}
              orientation="vertical"
            />

            {/* Custom industry description field - shown conditionally via JS */}
            <TextArea
              name="customIndustryDescription"
              label="Describe your organization type"
              placeholder="e.g., Medical device manufacturing, Food processing, Chemical manufacturing, etc."
              rows={3}
            />
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
