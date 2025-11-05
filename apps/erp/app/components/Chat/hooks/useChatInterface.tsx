import { useMount } from "@carbon/react";
import { useUrlParams } from "@carbon/remix";
import { useLocation } from "@remix-run/react";
import { generateId } from "ai";
import { useCallback } from "react";
import { path } from "~/utils/path";

export function useChatInterface() {
  const [params, setParams] = useUrlParams();
  const location = useLocation();
  const chatId = params.get("chatId") || null;

  const isChatPage = !!chatId;
  const isHome = location.pathname === path.to.authenticatedRoot;

  useMount(() => {
    if (isHome && !chatId) {
      setParams({ chatId: generateId() });
    }
  });

  const setChatId = useCallback(
    (id: string) => {
      setParams({ chatId: id });
    },
    [setParams]
  );

  return {
    isChatPage,
    chatId,
    setChatId,
  };
}
