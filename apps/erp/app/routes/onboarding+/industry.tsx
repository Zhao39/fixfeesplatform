import {
  assertIsPost,
  CarbonEdition,
  getCarbonServiceRole
} from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { setCompanyId } from "@carbon/auth/company.server";
import { updateCompanySession } from "@carbon/auth/session.server";
import { industries, industryInfo } from "@carbon/database/seed/demo";
import {
  useField,
  ValidatedForm,
  validationError,
  validator
} from "@carbon/form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
  FormControl,
  FormErrorMessage,
  HStack,
  RadioGroup,
  RadioGroupItem,
  VStack
} from "@carbon/react";
import { Edition } from "@carbon/utils";
import { getLocalTimeZone } from "@internationalized/date";
import { tasks } from "@trigger.dev/sdk";
import { useId, useState } from "react";
import {
  LuBot,
  LuCircleHelp,
  LuCog,
  LuFactory,
  LuWrench
} from "react-icons/lu";
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
import { insertEmployeeJob } from "~/modules/people";
import { getLocationsList, upsertLocation } from "~/modules/resources";
import {
  getCompanies,
  getCompany,
  insertCompany,
  onboardingCompanyValidator,
  onboardingIndustryTypes,
  seedCompany,
  updateCompany
} from "~/modules/settings";
import {
  clearOnboardingDraft,
  getOnboardingDraft
} from "~/services/onboarding-draft.server";

const onboardingIndustryValidator = z.object({
  industryId: z.enum(onboardingIndustryTypes, {
    errorMap: () => ({ message: "Please select an industry type" })
  }),
  customIndustryDescription: z.string().optional(),
  seedDemoData: zfd.checkbox(),
  next: z.string()
});

export async function loader({ request }: ActionFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const company = await getCompany(client, companyId);
  const draft = await getOnboardingDraft(request);

  if (company.error || !company.data) {
    return {
      company: null,
      draft
    };
  }

  return { company: company.data, draft };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {});

  // Get draft data from previous step (company)
  const draft = await getOnboardingDraft(request);

  const formData = await request.formData();

  // Validate industry fields
  const industryValidation = await validator(
    onboardingIndustryValidator
  ).validate(formData);

  if (industryValidation.error) {
    return validationError(industryValidation.error);
  }

  const { industryId, seedDemoData } = industryValidation.data;

  // Merge form data with draft data from company step
  const mergedFormData = formData;

  // Add company data from draft
  if (draft?.company) {
    if (draft.company.name) mergedFormData.append("name", draft.company.name);
    if (draft.company.addressLine1)
      mergedFormData.append("addressLine1", draft.company.addressLine1);
    if (draft.company.addressLine2)
      mergedFormData.append("addressLine2", draft.company.addressLine2);
    if (draft.company.city) mergedFormData.append("city", draft.company.city);
    if (draft.company.stateProvince)
      mergedFormData.append("stateProvince", draft.company.stateProvince);
    if (draft.company.postalCode)
      mergedFormData.append("postalCode", draft.company.postalCode);
    if (draft.company.countryCode)
      mergedFormData.append("countryCode", draft.company.countryCode);
    if (draft.company.baseCurrencyCode)
      mergedFormData.append("baseCurrencyCode", draft.company.baseCurrencyCode);
    if (draft.company.website)
      mergedFormData.append("website", draft.company.website);
  }

  // Validate the merged form data with the full company validator
  const validation = await validator(onboardingCompanyValidator).validate(
    mergedFormData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const serviceRole = getCarbonServiceRole();

  const { next, ...d } = validation.data;

  // Add industry data to the company data
  const companyData = {
    ...d
  };

  let companyId: string | undefined;

  const companies = await getCompanies(client, userId);
  const company = companies?.data?.[0];

  const locations = await getLocationsList(client, company?.id ?? "");
  const location = locations?.data?.[0];

  // Extract address data for location
  const addressData = {
    addressLine1: d.addressLine1,
    addressLine2: d.addressLine2,
    city: d.city,
    stateProvince: d.stateProvince,
    postalCode: d.postalCode,
    countryCode: d.countryCode
  };

  if (company && location) {
    // Update existing company and location
    const [companyUpdate, locationUpdate] = await Promise.all([
      updateCompany(serviceRole, company.id!, {
        ...companyData,
        updatedBy: userId
      }),
      upsertLocation(serviceRole, {
        ...location,
        ...addressData,
        timezone: getLocalTimeZone(),
        updatedBy: userId
      })
    ]);
    if (companyUpdate.error) {
      console.error(companyUpdate.error);
      throw new Error("Fatal: failed to update company");
    }
    if (locationUpdate.error) {
      console.error(locationUpdate.error);
      throw new Error("Fatal: failed to update location");
    }

    companyId = company.id!;
  } else {
    // Create new company
    if (!companyId) {
      const [companyInsert] = await Promise.all([
        insertCompany(serviceRole, companyData, userId)
      ]);
      if (companyInsert.error) {
        console.error(companyInsert.error);
        throw new Error("Fatal: failed to insert company");
      }

      companyId = companyInsert.data?.id;
    }

    if (!companyId) {
      throw new Error("Fatal: failed to get company ID");
    }

    const seed = await seedCompany(serviceRole, companyId, userId);
    if (seed.error) {
      console.error(seed.error);
      throw new Error("Fatal: failed to seed company");
    }

    if (CarbonEdition === Edition.Cloud) {
      tasks.trigger("onboard", {
        type: "lead",
        companyId,
        userId
      });
    }

    // Trigger demo data seeding if requested
    if (seedDemoData && industryId) {
      // Use the selected industry, or default to cnc_aerospace if custom
      const demoIndustryId =
        industryId === "custom" ? "cnc_aerospace" : industryId;

      tasks.trigger("seed-demo-data", {
        companyId,
        industryId: demoIndustryId,
        userId
      });
    }

    // Create location
    const [locationInsert] = await Promise.all([
      upsertLocation(serviceRole, {
        ...addressData,
        name: "Headquarters",
        companyId,
        timezone: getLocalTimeZone(),
        createdBy: userId
      })
    ]);

    if (locationInsert.error) {
      console.error(locationInsert.error);
      throw new Error("Fatal: failed to insert location");
    }

    const locationId = locationInsert.data?.id;
    if (!locationId) {
      throw new Error("Fatal: failed to get location ID");
    }

    // Create employee job
    const [job] = await Promise.all([
      insertEmployeeJob(serviceRole, {
        id: userId,
        companyId,
        locationId
      })
    ]);

    if (job.error) {
      console.error(job.error);
      throw new Error("Fatal: failed to insert job");
    }
  }

  const sessionCookie = await updateCompanySession(request, companyId!);
  const companyIdCookie = setCompanyId(companyId!);
  const clearDraftCookie = await clearOnboardingDraft(request);

  throw redirect(next, {
    headers: [
      ["Set-Cookie", sessionCookie],
      ["Set-Cookie", companyIdCookie],
      ["Set-Cookie", clearDraftCookie]
    ]
  });
}

// Icon mapping for industries
const industryIcons: Record<string, React.ReactNode> = {
  robotics_oem: <LuBot className="h-5 w-5" />,
  cnc_aerospace: <LuCog className="h-5 w-5" />,
  metal_fabrication: <LuFactory className="h-5 w-5" />,
  automotive_precision: <LuWrench className="h-5 w-5" />,
  custom: <LuCircleHelp className="h-5 w-5" />
};

// IndustryCardSelector component for card-based radio selection
function IndustryCardSelector({
  name,
  options,
  onSelect
}: {
  name: string;
  options: { value: string; label: string; description: string }[];
  onSelect: (value: string) => void;
}) {
  const { getInputProps, error } = useField(name);
  const id = useId();
  const inputProps = getInputProps();

  return (
    <FormControl isInvalid={!!error}>
      <RadioGroup
        {...inputProps}
        name={name}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {options.map(({ value, label, description }) => (
          <label
            key={value}
            htmlFor={`${id}:${value}`}
            className={cn(
              "group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all duration-200",
              "bg-card hover:bg-accent/50",
              "border-border hover:border-primary/50",
              "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
              "has-[[data-state=checked]]:shadow-lg has-[[data-state=checked]]:shadow-primary/10"
            )}
            onClick={() => onSelect(value)}
          >
            <div className="flex flex-col h-full gap-3">
              <div className="flex items-start justify-between">
                {/* Icon container with gradient background */}
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground",
                    "group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary",
                    "group-has-[[data-state=checked]]:from-primary group-has-[[data-state=checked]]:to-primary/80 group-has-[[data-state=checked]]:text-primary-foreground"
                  )}
                >
                  {industryIcons[value] || <LuFactory className="h-5 w-5" />}
                </div>

                <RadioGroupItem
                  value={value}
                  id={`${id}:${value}`}
                  className={cn(
                    "h-5 w-5 border-2 transition-all mt-1",
                    "group-has-[[data-state=checked]]:border-primary group-has-[[data-state=checked]]:text-primary"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-base font-semibold transition-colors mb-1",
                    "text-foreground group-hover:text-primary",
                    "group-has-[[data-state=checked]]:text-primary"
                  )}
                >
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  {description}
                </p>
              </div>
            </div>
          </label>
        ))}
      </RadioGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}

export default function OnboardingIndustry() {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("");

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
  ];
  const initialValues = {
    industryId:
      company?.industryId &&
      validIndustryIds.includes(company.industryId as any)
        ? company.industryId
        : undefined,
    customIndustryDescription: company?.customIndustryDescription ?? "",
    seedDemoData: company?.seedDemoData ?? false
  };

  return (
    <Card className="max-w-3xl">
      <ValidatedForm
        validator={onboardingIndustryValidator}
        defaultValues={initialValues}
        method="post"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">
            Which best describes your company?
          </CardTitle>
          <CardDescription className="text-base">
            This helps us customize your experience with relevant features and
            demo data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Hidden name="next" value={next} />
          <VStack spacing={4}>
            <IndustryCardSelector
              name="industryId"
              options={industryOptions}
              onSelect={setSelectedIndustryId}
            />

            {/* Custom industry description */}
            {selectedIndustryId === "custom" && (
              <TextArea
                name="customIndustryDescription"
                label="Describe your organization type"
                placeholder="e.g., Medical device manufacturing, Food processing, Chemical manufacturing, etc."
                rows={3}
              />
            )}

            {/* Demo data checkbox */}
            <HStack className="pt-2">
              <Checkbox id="seedDemoData" name="seedDemoData" />
              <label htmlFor="seedDemoData" className="text-sm">
                Create demo data for me
              </label>
            </HStack>
          </VStack>
        </CardContent>

        <CardFooter className="pt-4">
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
