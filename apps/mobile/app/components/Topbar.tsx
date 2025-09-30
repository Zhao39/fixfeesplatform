import { HStack } from "@carbon/react";
import { useMode } from "@carbon/remix";
import { Link } from "@remix-run/react";
import { BsFillHexagonFill } from "react-icons/bs";
import { useUser } from "~/hooks";
import AvatarMenu from "./AvatarMenu";
import Feedback from "./Feedback";

const Topbar = () => {
  const { company } = useUser();
  const mode = useMode();
  const companyLogo = mode === "dark" ? company.logoDark : company.logoLight;

  return (
    <div className="h-[49px] w-full flex justify-between bg-background text-foreground px-4 top-0 sticky z-10 items-center">
      <Link to="/" className="flex-1 flex items-center gap-1">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-foreground">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${company.name} logo`}
              className="h-full w-full rounded object-contain"
            />
          ) : (
            <BsFillHexagonFill />
          )}
        </div>
      </Link>

      <HStack spacing={1} className="flex-1 justify-end py-2">
        <Feedback />
        <AvatarMenu />
      </HStack>
    </div>
  );
};

export default Topbar;
