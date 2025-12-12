import { cn } from "@carbon/react";
import type { ComponentProps, PropsWithChildren } from "react";
import type { LinkProps } from "react-router";
import { Link } from "react-router";

const Hyperlink = ({
  children,
  className,
  ...props
}:
  | PropsWithChildren<LinkProps>
  | PropsWithChildren<ComponentProps<"span">>) => {
  return "to" in props && props.to ? (
    <Link
      prefetch="intent"
      className={cn(
        "text-foreground hover:underline cursor-pointer font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  ) : (
    <span
      className={cn(
        "text-foreground hover:underline cursor-pointer ",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Hyperlink;
