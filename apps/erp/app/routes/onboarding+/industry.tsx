import { assertIsPost } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
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
  cn,
  FormControl,
  FormErrorMessage,
  HStack,
  RadioGroup,
  RadioGroupItem,
  VStack
} from "@carbon/react";
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
import { Hidden, Submit, TextArea } from "~/components/Form";
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

// Icon mapping for industries
const industryIcons: Record<string, React.ReactNode> = {
  robotics_oem: <LuBot className="h-6 w-6" />,
  cnc_aerospace: <LuCog className="h-6 w-6" />,
  metal_fabrication: <LuFactory className="h-6 w-6" />,
  automotive_precision: <LuWrench className="h-6 w-6" />,
  custom: <LuCircleHelp className="h-6 w-6" />
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
              "group relative flex cursor-pointer flex-col rounded-xl border-2 p-6 transition-all duration-200",
              "bg-card hover:bg-accent/50",
              "border-border hover:border-primary/50",
              "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
              "has-[[data-state=checked]]:shadow-lg has-[[data-state=checked]]:shadow-primary/10",
              value === "custom" && "md:col-span-2"
            )}
            onClick={() => onSelect(value)}
          >
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-start justify-between">
                {/* Icon container with gradient background */}
                <div
                  className={cn(
                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground",
                    "group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary",
                    "group-has-[[data-state=checked]]:from-primary group-has-[[data-state=checked]]:to-primary/80 group-has-[[data-state=checked]]:text-primary-foreground"
                  )}
                >
                  {industryIcons[value] || <LuFactory className="h-6 w-6" />}
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
                    "text-lg font-bold transition-colors mb-2",
                    "text-foreground group-hover:text-primary",
                    "group-has-[[data-state=checked]]:text-primary"
                  )}
                >
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Selection indicator bar */}
            <div
              className={cn(
                "absolute bottom-0 left-0 h-1 w-full rounded-b-xl transition-all duration-300",
                "bg-transparent group-has-[[data-state=checked]]:bg-gradient-to-r group-has-[[data-state=checked]]:from-primary group-has-[[data-state=checked]]:to-primary/60"
              )}
            />
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
    <Card className="max-w-3xl">
      <ValidatedForm
        validator={onboardingIndustryValidator}
        defaultValues={initialValues}
        method="post"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">
            What type of organization are you?
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

            {/* Custom industry description field - shown conditionally via JS */}
            {selectedIndustryId === "custom" && (
              <TextArea
                name="customIndustryDescription"
                label="Describe your organization type"
                placeholder="e.g., Medical device manufacturing, Food processing, Chemical manufacturing, etc."
                rows={3}
              />
            )}
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
