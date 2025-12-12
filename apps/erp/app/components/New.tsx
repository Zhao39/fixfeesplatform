import type { ButtonProps } from "@carbon/react";
import {
  Button,
  HStack,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useKeyboardShortcuts
} from "@carbon/react";
import { useRef } from "react";
import { LuCirclePlus } from "react-icons/lu";
import { Link } from "react-router";

type NewProps = {
  label?: string;
  to: string;
  variant?: ButtonProps["variant"];
};

const New = ({ label, to, variant = "primary" }: NewProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useKeyboardShortcuts({
    n: (event: KeyboardEvent) => {
      event.stopPropagation();
      buttonRef.current?.click();
    }
  });

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          asChild
          leftIcon={<LuCirclePlus />}
          variant={variant}
          ref={buttonRef}
        >
          <Link to={to} prefetch="intent">
            Add {label}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <HStack>
          <Kbd>N</Kbd>
        </HStack>
      </TooltipContent>
    </Tooltip>
  );
};

export default New;
