import type { ComboboxProps } from "@carbon/form";
import { Combobox } from "@carbon/form";
import { useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import type {
  AccountSubcategory as AccountSubcategoryType,
  getAccountSubcategoriesByCategory
} from "~/modules/accounting";
import { path } from "~/utils/path";

type AccountSubcategorySelectProps = Omit<
  ComboboxProps,
  "options" | "onChange"
> & {
  accountCategoryId?: string;
  onChange?: (accountCategory: AccountSubcategoryType | null) => void;
};

const AccountSubcategory = (props: AccountSubcategorySelectProps) => {
  const accountSubcategoriesFetcher =
    useFetcher<Awaited<ReturnType<typeof getAccountSubcategoriesByCategory>>>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: suppressed due to migration
  useEffect(() => {
    if (props?.accountCategoryId) {
      accountSubcategoriesFetcher.load(
        path.to.api.accountingSubcategories(props.accountCategoryId)
      );
    }
  }, [props.accountCategoryId]);

  const options = useMemo(
    () =>
      accountSubcategoriesFetcher.data?.data?.map((c) => ({
        value: c.id,
        label: c.name
      })) ?? [],

    [accountSubcategoriesFetcher.data]
  );

  const onChange = (
    newValue: {
      label: string | React.ReactNode;
      value: string;
    } | null
  ) => {
    const subCategory =
      accountSubcategoriesFetcher.data?.data?.find(
        (subCategory) => subCategory.id === newValue?.value
      ) ?? null;

    props.onChange?.(subCategory as AccountSubcategoryType | null);
  };

  return (
    <Combobox
      options={options}
      {...props}
      onChange={onChange}
      label={props?.label ?? "Account Subcategory"}
    />
  );
};

export default AccountSubcategory;
