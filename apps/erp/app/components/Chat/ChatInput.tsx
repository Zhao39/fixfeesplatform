import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { useChatActions, useChatId, useChatStatus } from "@ai-sdk-tools/store";
import { cn } from "@carbon/react";
import { useRef } from "react";
import { CommandMenu } from "./CommandMenu";
import { FollowupQuestions } from "./FollowupQuestions";
import { useChatStore } from "./lib/store";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./PromptInput";
import { RecordButton } from "./RecordButton";
import { SuggestedActionsButton } from "./SuggestedActions";
import { WebSearchButton } from "./WebSearch";

export interface ChatInputMessage extends PromptInputMessage {
  metadata?: {
    agentChoice?: string;
    toolChoice?: string;
  };
}

export function ChatInput({ hasMessages }: { hasMessages: boolean }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const status = useChatStatus();
  const { sendMessage } = useChatActions();
  const chatId = useChatId();

  const { current } = useArtifacts({
    exclude: ["chat-title", "followup-questions"],
  });
  const isCanvasVisible = !!current;

  const {
    input,
    isWebSearch,
    isUploading,
    isRecording,
    isProcessing,
    showCommands,
    selectedCommandIndex,
    filteredCommands,
    setInput,
    handleInputChange,
    handleKeyDown,
    resetCommandState,
  } = useChatStore();

  const handleSubmit = (message: ChatInputMessage) => {
    // If currently streaming or submitted, stop instead of submitting
    if (status === "streaming" || status === "submitted") {
      stop();
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage({
      text: message.text || "Sent with attachments",
      files: message.files,
      metadata: {
        agentChoice: message.metadata?.agentChoice,
        toolChoice: message.metadata?.toolChoice,
      },
    });
    setInput("");
  };

  return (
    <>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          hasMessages ? "absolute bottom-6 left-0 z-20" : "",
          isCanvasVisible ? "right-[603px]" : "right-0"
        )}
      >
        <div className="mx-auto w-full pt-2 relative">
          <FollowupQuestions />

          {/* Command Suggestions Menu */}
          <CommandMenu />

          <PromptInput onSubmit={handleSubmit} globalDrop multiple>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                ref={textareaRef}
                autoFocus
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // Handle Enter key for commands
                  if (e.key === "Enter" && showCommands) {
                    e.preventDefault();
                    const selectedCommand =
                      filteredCommands[selectedCommandIndex];
                    if (selectedCommand) {
                      // Execute command through the store
                      if (!chatId) return;

                      sendMessage({
                        role: "user",
                        parts: [{ type: "text", text: selectedCommand.title }],
                        metadata: {
                          toolCall: {
                            toolName: selectedCommand.toolName,
                            toolParams: selectedCommand.toolParams,
                          },
                        },
                      });

                      setInput("");
                      resetCommandState();
                    }
                    return;
                  }

                  // Handle Enter key for normal messages
                  if (e.key === "Enter" && !showCommands) {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({
                        text: input,
                        files: [],
                        metadata: {
                          webSearch: isWebSearch,
                        },
                      });

                      setInput("");
                      resetCommandState();
                    }
                    return;
                  }

                  // Handle other keys normally
                  handleKeyDown(e);
                }}
                value={input}
                placeholder={
                  isWebSearch ? "Search the web" : "You can just do things"
                }
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionAddAttachments />
                <SuggestedActionsButton />
                <WebSearchButton />
              </PromptInputTools>

              <PromptInputTools>
                <RecordButton size={16} />
                <PromptInputSubmit
                  disabled={
                    (!input && !status) ||
                    isUploading ||
                    isRecording ||
                    isProcessing
                  }
                  status={status}
                />
              </PromptInputTools>
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
