import { Heading, cn } from "@carbon/react";
import type { Authenticated, NavItem } from "@carbon/utils";
import { getLocalTimeZone, now } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { Link } from "@remix-run/react";
import { useMemo, type ComponentProps } from "react";
import { useModules, useUser } from "~/hooks";

export default function AppIndexRoute() {
  const user = useUser();
  // const permissions = usePermissions();
  const modules = useModules();
  const { locale } = useLocale();
  const date = new Date();

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeZone: getLocalTimeZone(),
      }),
    [locale]
  );

  const greeting = useMemo(() => {
    const time = now(getLocalTimeZone());

    if (time.hour >= 3 && time.hour < 11) {
      return "Good Morning";
    } else if (time.hour >= 11 && time.hour < 16) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 px-8 py-6 w-full h-[calc(100dvh-49px)] bg-muted overflow-auto">
      <div className="flex flex-col">
        <Heading size="h3">
          {greeting}, {user.firstName}
        </Heading>
        <Subheading>{formatter.format(date)}</Subheading>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        {/* {permissions.can("view", "production") && (
          <ModuleCard
            module={{
              name: "Schedule",
              to: path.to.schedule,
              icon: LuCalendarClock,
            }}
          />
        )} */}
        {modules
          .filter((mod) => mod.name !== "Settings")
          .map((module) => (
            <ModuleCard key={module.name} module={module} />
          ))}
      </div>
    </div>
  );
}

const Subheading = ({ children, className }: ComponentProps<"p">) => (
  <p className={cn("text-muted-foreground text-base font-light", className)}>
    {children}
  </p>
);

const ModuleCard = ({ module }: { module: Authenticated<NavItem> }) => (
  <Link
    to={module.to}
    prefetch="intent"
    className="aspect-video flex flex-col gap-3 items-center justify-center py-8  shadow-button-base bg-gradient-to-bl from-card from-50% to-background rounded-lg text-center group ring-2 ring-transparent hover:ring-white/10 cursor-pointer hover:scale-105 transition-all duration-300"
  >
    <div className="p-4 rounded-lg border">
      <module.icon className="text-2xl" />
    </div>
    <span className="text-sm py-1 px-4 border border-border rounded-full group-hover:bg-accent font-medium tracking-tight">
      {module.name}
    </span>
  </Link>
);
