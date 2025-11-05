import { Button } from "@carbon/react";
import {
  LuAudioLines,
  LuChevronDown,
  LuSearch,
  LuSquarePen,
} from "react-icons/lu";
import CreateMenu from "../Layout/Topbar/CreateMenu";

export function ChatWidgets() {
  return (
    <div className="w-full flex gap-3 justify-center items-center">
      <Button
        variant="secondary"
        className="rounded-full"
        leftIcon={<LuSearch />}
      >
        Search
      </Button>
      <CreateMenu
        trigger={
          <Button
            variant="secondary"
            className="rounded-full"
            leftIcon={<LuSquarePen />}
            rightIcon={<LuChevronDown />}
          >
            Create
          </Button>
        }
      />
      <Button
        variant="secondary"
        className="rounded-full"
        leftIcon={<LuAudioLines />}
      >
        Voice
      </Button>
    </div>
  );
}
