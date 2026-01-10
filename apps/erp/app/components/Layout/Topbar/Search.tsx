import type { ShortcutDefinition } from "@carbon/react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  HStack,
  Modal,
  ModalContent,
  ShortcutKey,
  useDebounce,
  useShortcutKeys,
  VStack
} from "@carbon/react";
import idb from "localforage";
import { nanoid } from "nanoid";
import { memo, useEffect, useState } from "react";
import {
  LuFileCheck,
  LuHardHat,
  LuSearch,
  LuShoppingCart,
  LuSquareUser,
  LuUser,
  LuWrench
} from "react-icons/lu";
import { PiShareNetworkFill } from "react-icons/pi";
import { RiProgress8Line } from "react-icons/ri";
import { RxMagnifyingGlass } from "react-icons/rx";
import { useFetcher, useNavigate } from "react-router";
import { MethodItemTypeIcon } from "~/components/Icons";
import { useModules, useUser } from "~/hooks";
import useAccountSubmodules from "~/modules/account/ui/useAccountSubmodules";
import useAccountingSubmodules from "~/modules/accounting/ui/useAccountingSubmodules";
import useDocumentsSubmodules from "~/modules/documents/ui/useDocumentsSubmodules";
import useInventorySubmodules from "~/modules/inventory/ui/useInventorySubmodules";
import useInvoicingSubmodules from "~/modules/invoicing/ui/useInvoicingSubmodules";
import useItemsSubmodules from "~/modules/items/ui/useItemsSubmodules";
import usePeopleSubmodules from "~/modules/people/ui/usePeopleSubmodules";
import useProductionSubmodules from "~/modules/production/ui/useProductionSubmodules";
import usePurchasingSubmodules from "~/modules/purchasing/ui/usePurchasingSubmodules";
import useQualitySubmodules from "~/modules/quality/ui/useQualitySubmodules";
import useResourcesSubmodules from "~/modules/resources/ui/useResourcesSubmodules";
import useSalesSubmodules from "~/modules/sales/ui/useSalesSubmodules";
import useSettingsSubmodules from "~/modules/settings/ui/useSettingsSubmodules";
import useUsersSubmodules from "~/modules/users/ui/useUsersSubmodules";
import type { SearchResponse } from "~/routes/api+/search";
import { useUIStore } from "~/stores/ui";

import type { Authenticated, Route } from "~/types";

type RecentSearch = Route & { entityType?: string; module?: string };

const shortcut: ShortcutDefinition = {
  key: "K",
  modifiers: ["mod"]
};

const SearchModal = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher<SearchResponse>();
  const { isSearchModalOpen, closeSearchModal } = useUIStore();
  const { company } = useUser();
  const storageKey = `recentSearches_${company.id}`;

  const [input, setInput] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceSearch = useDebounce((q: string) => {
    if (q && q.length >= 2) {
      fetcher.load(`/api/search?q=${encodeURIComponent(q)}`);
    }
    setIsDebouncing(false);
  }, 500);

  useEffect(() => {
    if (isSearchModalOpen) {
      setInput("");
    }
  }, [isSearchModalOpen]);

  const staticResults = useGroupedSubmodules();
  const modules = useModules();

  const getModuleIcon = (moduleName: string) => {
    const module = modules.find(
      (m) => m.name.toLowerCase() === moduleName.toLowerCase()
    );
    return module?.icon;
  };

  const [recentResults, setRecentResults] = useState<RecentSearch[]>([]);
  useEffect(() => {
    const loadRecentSearches = async () => {
      const recentResultsFromStorage =
        await idb.getItem<RecentSearch[]>(storageKey);
      if (recentResultsFromStorage) {
        setRecentResults(recentResultsFromStorage);
      } else {
        setRecentResults([]);
      }
    };
    loadRecentSearches();
  }, [storageKey]);

  const recentPaths = new Set(recentResults.map((r) => r.to));
  const searchResults = (fetcher.data?.results ?? []).filter(
    (r) => !recentPaths.has(r.link)
  );
  const loading = fetcher.state === "loading";

  const onInputChange = (value: string) => {
    setInput(value);
    if (value && value.length >= 2) {
      setIsDebouncing(true);
    }
    debounceSearch(value);
  };

  const onSelect = async (
    route: Route,
    entityType?: string,
    module?: string
  ) => {
    const { to, name } = route;
    navigate(route.to);
    closeSearchModal();
    const newRecentSearches: RecentSearch[] = [
      { to, name, entityType, module },
      ...((await idb.getItem<RecentSearch[]>(storageKey))?.filter(
        (item) => item.to !== to
      ) ?? [])
    ].slice(0, 5);

    setRecentResults(newRecentSearches);
    idb.setItem(storageKey, newRecentSearches);
  };

  return (
    <Modal
      open={isSearchModalOpen}
      onOpenChange={(open) => {
        setInput("");
        if (!open) closeSearchModal();
      }}
    >
      <ModalContent
        className="rounded-lg translate-y-0 p-0 h-[343px]"
        withCloseButton={false}
      >
        <Command>
          <CommandInput
            placeholder="Type a command or search..."
            value={input}
            onValueChange={onInputChange}
          />
          <CommandList>
            <CommandEmpty key="empty">
              {loading || isDebouncing ? "Loading..." : "No results found."}
            </CommandEmpty>
            {recentResults.length > 0 && (
              <>
                <CommandGroup heading="Recent Searches" key="recent">
                  {recentResults.map((result, index) => {
                    const ModuleIcon = result.module
                      ? getModuleIcon(result.module)
                      : undefined;
                    return (
                      <CommandItem
                        key={`${result.to}-${nanoid()}-${index}`}
                        onSelect={() =>
                          onSelect(result, result.entityType, result.module)
                        }
                        // append with : so we're not sharing a value with a static result
                        value={`:${result.to}`}
                      >
                        {result.entityType ? (
                          <ResultIcon entityType={result.entityType} />
                        ) : ModuleIcon ? (
                          <ModuleIcon className="w-4 h-4 flex-shrink-0 mr-2" />
                        ) : (
                          <RxMagnifyingGlass className="w-4 h-4 flex-shrink-0 mr-2" />
                        )}
                        {result.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            {searchResults.length > 0 && (
              <CommandGroup heading="Search Results" key="search">
                {searchResults.map((result) => (
                  <CommandItem
                    key={`${result.id}-${nanoid()}`}
                    value={`${input}${result.id}`}
                    onSelect={() =>
                      onSelect(
                        {
                          to: result.link,
                          name: result.title
                        },
                        result.entityType
                      )
                    }
                  >
                    <HStack>
                      <ResultIcon entityType={result.entityType} />
                      <VStack spacing={0}>
                        <span>{result.title}</span>
                        {result.description && (
                          <span className="text-xs text-muted-foreground">
                            {result.description}
                          </span>
                        )}
                      </VStack>
                    </HStack>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {Object.entries(staticResults).map(([module, submodules]) => {
              const filteredSubmodules = submodules.filter(
                (s) => !recentPaths.has(s.to)
              );
              if (filteredSubmodules.length === 0) return null;
              return (
                <>
                  <CommandGroup heading={module} key={`static-${module}`}>
                    {filteredSubmodules.map((submodule, index) => (
                      <CommandItem
                        key={`${submodule.to}-${submodule.name}-${index}`}
                        onSelect={() => onSelect(submodule, undefined, module)}
                        value={`${module} ${submodule.name}`}
                      >
                        {submodule.icon && (
                          <submodule.icon className="w-4 h-4 flex-shrink-0 mr-2" />
                        )}
                        <span>{submodule.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              );
            })}
          </CommandList>
        </Command>
      </ModalContent>
    </Modal>
  );
};

function ResultIcon({ entityType }: { entityType: string }) {
  switch (entityType) {
    case "customer":
      return <LuSquareUser className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "employee":
      return <LuUser className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "job":
      return <LuHardHat className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "item":
      return (
        <MethodItemTypeIcon
          type="Part"
          className="w-4 h-4 flex-shrink-0 mr-2"
        />
      );
    case "equipmentType":
    case "workCellType":
      return <LuWrench className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "purchaseOrder":
      return <LuShoppingCart className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "salesInvoice":
      return <RiProgress8Line className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "purchaseInvoice":
      return <LuFileCheck className="w-4 h-4 flex-shrink-0 mr-2" />;
    case "supplier":
      return <PiShareNetworkFill className="w-4 h-4 flex-shrink-0 mr-2" />;
    default:
      return null;
  }
}

const SearchButton = () => {
  const { openSearchModal } = useUIStore();

  useShortcutKeys({
    shortcut: shortcut,
    action: openSearchModal
  });

  return (
    <div className="hidden sm:block">
      <Button
        leftIcon={<LuSearch />}
        variant="secondary"
        className="w-[200px] px-2 hover:scale-100"
        onClick={openSearchModal}
      >
        <HStack className="w-full">
          <div className="flex flex-grow">Search</div>
          <ShortcutKey variant="small" shortcut={shortcut} />
        </HStack>
      </Button>
      <SearchModal />
    </div>
  );
};

function useGroupedSubmodules() {
  const modules = useModules();
  const items = useItemsSubmodules();
  const production = useProductionSubmodules();
  const inventory = useInventorySubmodules();
  const sales = useSalesSubmodules();
  const purchasing = usePurchasingSubmodules();
  const documents = useDocumentsSubmodules();
  // const messages = useMessagesSidebar();
  const accounting = useAccountingSubmodules();
  const invoicing = useInvoicingSubmodules();
  const users = useUsersSubmodules();
  const settings = useSettingsSubmodules();
  const people = usePeopleSubmodules();
  const quality = useQualitySubmodules();
  const resources = useResourcesSubmodules();
  const account = useAccountSubmodules();
  const groupedSubmodules: Record<
    string,
    {
      groups: {
        routes: Authenticated<Route>[];
        name: string;
        icon?: any;
      }[];
    }
  > = {
    items,
    inventory,
    sales,
    purchasing,
    quality,
    accounting,
    invoicing,
    people,
    production,
    resources,
    settings,
    users
  };

  const ungroupedSubmodules: Record<string, { links: Route[] }> = {
    documents,
    "my account": account
  };

  const shortcuts = modules.reduce<Record<string, Route[]>>((acc, module) => {
    const moduleName = module.name.toLowerCase();

    if (moduleName in groupedSubmodules) {
      const groups = groupedSubmodules[moduleName].groups;
      acc = {
        ...acc,
        [module.name]: groups.flatMap((group) =>
          group.routes.map((route) => ({
            to: route.to,
            name: route.name,
            icon: module.icon
          }))
        )
      };
    } else if (
      moduleName in ungroupedSubmodules ||
      moduleName === "my account"
    ) {
      acc = {
        ...acc,
        [module.name]: ungroupedSubmodules[moduleName].links.map((link) => ({
          to: link.to,
          name: link.name,
          icon: module.icon
        }))
      };
    }

    return acc;
  }, {});

  return shortcuts;
}

export default memo(SearchButton);
