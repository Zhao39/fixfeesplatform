import {
  assertIsPost,
  CarbonEdition,
  getCarbonServiceRole
} from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { setCompanyId } from "@carbon/auth/company.server";
import { updateCompanySession } from "@carbon/auth/session.server";
import { ValidatedForm, validationError, validator } from "@carbon/form";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  HStack,
  VStack
} from "@carbon/react";
import { Edition } from "@carbon/utils";
import { getLocalTimeZone } from "@internationalized/date";
import { tasks } from "@trigger.dev/sdk";
import {
  type ActionFunctionArgs,
  Link,
  redirect,
  useLoaderData
} from "react-router";
import {
  AddressAutocomplete,
  Currency,
  Hidden,
  Input,
  Submit
} from "~/components/Form";
import { useOnboarding } from "~/hooks";
import { insertEmployeeJob } from "~/modules/people";
import { getLocationsList, upsertLocation } from "~/modules/resources";
import {
  addressValidator,
  getCompanies,
  getCompany,
  insertCompany,
  onboardingCompanyValidator,
  seedCompany,
  updateCompany
} from "~/modules/settings";
import {
  clearOnboardingDraft,
  getOnboardingDraft
} from "~/services/onboarding-draft.server";

export async function loader({ request }: ActionFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const company = await getCompany(client, companyId ?? 1);
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

  // Get draft data from previous steps
  const draft = await getOnboardingDraft(request);

  // Validate address fields separately
  const formData = await request.formData();

  const addressValidation = await validator(
    onboardingCompanyValidator
  ).validate(formData);

  if (addressValidation.error) {
    return validationError(addressValidation.error);
  }

  const { next: _companyNext, ...addressData } = addressValidation.data;

  // Merge form data with draft data
  const mergedFormData = new FormData();
  formData.forEach((value, key) => {
    mergedFormData.append(key, value);
  });

  // Add draft data to form data if not already present
  if (draft?.industry) {
    if (!mergedFormData.has("industryId")) {
      mergedFormData.append("industryId", draft.industry.industryId);
    }
    if (
      draft.industry.customIndustryDescription &&
      !mergedFormData.has("customIndustryDescription")
    ) {
      mergedFormData.append(
        "customIndustryDescription",
        draft.industry.customIndustryDescription
      );
    }
  }

  if (draft?.modules) {
    const selectedModules = [
      draft.modules.isSalesEnabled ? "Sales" : null,
      draft.modules.isPurchasingEnabled ? "Purchasing" : null,
      draft.modules.isPartsEnabled ? "Parts" : null,
      draft.modules.isInventoryEnabled ? "Inventory" : null
    ].filter(Boolean) as string[];

    if (selectedModules.length > 0 && !mergedFormData.has("selectedModules")) {
      selectedModules.forEach((module) => {
        mergedFormData.append("selectedModules", module);
      });
    }

    if (
      draft.modules.featureRequests &&
      !mergedFormData.has("featureRequests")
    ) {
      mergedFormData.append("featureRequests", draft.modules.featureRequests);
    }

    // seedDemoData uses zfd.checkbox() - append "on" if true, omit if false
    if (draft.modules.seedDemoData && !mergedFormData.has("seedDemoData")) {
      mergedFormData.append("seedDemoData", "on");
    }
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

  // Merge seedDemoData from draft if not already in validation data
  if (
    draft?.modules?.seedDemoData !== undefined &&
    d.seedDemoData === undefined
  ) {
    d.seedDemoData = draft.modules.seedDemoData;
  }

  let companyId: string | undefined;

  const companies = await getCompanies(client, userId);
  const company = companies?.data?.[0];

  const locations = await getLocationsList(client, company?.id ?? "");
  const location = locations?.data?.[0];

  if (company && location) {
    // Extract only location fields (address fields + name)

    const [companyUpdate, locationUpdate] = await Promise.all([
      updateCompany(serviceRole, company.id!, {
        ...d,
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
  } else {
    if (!companyId) {
      const [companyInsert] = await Promise.all([
        insertCompany(serviceRole, d, userId)
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
    const companyData = await getCompany(serviceRole, companyId);
    if (
      companyData.data?.seedDemoData &&
      companyData.data?.industryId &&
      companyData.data?.selectedModules
    ) {
      // Use the selected industry, or default to cnc_aerospace if custom
      const industryId =
        companyData.data.industryId === "custom"
          ? "cnc_aerospace"
          : companyData.data.industryId;

      // If seedDemoData is true, seed all core modules regardless of selection
      const modules = companyData.data.seedDemoData
        ? ["Sales", "Purchasing", "Parts", "Inventory"]
        : companyData.data.selectedModules;

      tasks.trigger("seed-demo-data", {
        companyId,
        industryId,
        modules,
        userId
      });
    }

    // Extract only location fields (address fields + name)
    // Exclude company-only fields
    const locationData = {
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      city: d.city,
      stateProvince: d.stateProvince,
      postalCode: d.postalCode,
      countryCode: d.countryCode
    };

    // TODO: move all of this to transaction
    const [locationInsert] = await Promise.all([
      upsertLocation(serviceRole, {
        ...locationData,
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

export default function OnboardingCompany() {
  const { company, draft } = useLoaderData<typeof loader>();
  const { next, previous } = useOnboarding();

  const initialValues = {
    name: company?.name ?? draft?.company?.name ?? "",
    addressLine1: company?.addressLine1 ?? draft?.company?.addressLine1 ?? "",
    addressLine2: company?.addressLine2 ?? draft?.company?.addressLine2 ?? "",
    city: company?.city ?? draft?.company?.city ?? "",
    stateProvince:
      company?.stateProvince ?? draft?.company?.stateProvince ?? "",
    postalCode: company?.postalCode ?? draft?.company?.postalCode ?? "",
    countryCode: company?.countryCode ?? draft?.company?.countryCode ?? "US",
    baseCurrencyCode:
      company?.baseCurrencyCode ?? draft?.company?.baseCurrencyCode ?? "USD",
    website: company?.website ?? draft?.company?.website ?? ""
  };

  return (
    <Card className="max-w-lg">
      <ValidatedForm
        validator={addressValidator}
        defaultValues={initialValues}
        method="post"
      >
        <CardHeader>
          <CardTitle>Now let's set up your company</CardTitle>
        </CardHeader>
        <CardContent>
          <Hidden name="next" value={next} />
          <VStack spacing={4}>
            <Input autoFocus name="name" label="Company Name" />
            <AddressAutocomplete />
            <Input name="website" label="Website" />
            <Currency name="baseCurrencyCode" label="Base Currency" />
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
