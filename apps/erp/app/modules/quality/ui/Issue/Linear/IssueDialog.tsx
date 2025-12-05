import {
  Badge,
  Button,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useDisclosure,
} from "@carbon/react";
import { useState } from "react";
import type { IssueActionTask } from "~/modules/quality/types";

import { LinearIssueSchema, type LinearIssue } from "@carbon/ee/linear";
import { LinearIcon } from "~/components/Icons";
import { CreateIssue } from "./CreateIssue";
import { LinkIssue } from "./LinkIssue";

interface Props {
  task: IssueActionTask;
}

export const LinearIssueDialog = ({ task }: Props) => {
  const disclosure = useDisclosure();
  const [tab, setTab] = useState("link");

  const externalId = task.externalId as { linear: LinearIssue } | undefined;

  const { data: linked } = LinearIssueSchema.safeParse(externalId?.linear);

  return (
    <Modal
      open={disclosure.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          disclosure.onClose();
        }
      }}
    >
      <ModalTrigger onClick={() => disclosure.onToggle()}>
        <Button
          leftIcon={
            <LinearIcon className={cn(linked ? "" : "grayscale", "size-4")} />
          }
          variant="ghost"
          aria-label="Connect Linear issue"
        >
          {linked ? `${linked.identifier}` : "Link to Linear"}
        </Button>
      </ModalTrigger>
      <ModalContent size={"xlarge"}>
        <Tabs value={tab} onValueChange={setTab} defaultValue="link">
          <ModalHeader className="mb-1 flex-row justify-between py-3">
            <div className="space-y-1">
              <ModalTitle>Link Linear Issue</ModalTitle>
              <ModalDescription>
                Search for an existing issue or create a new one
              </ModalDescription>
            </div>

            <TabsList className="max-w-max mb-4">
              <TabsTrigger value="link">Link Existing</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
          </ModalHeader>
          <ModalBody>
            {linked && (
              <div
                className={cn(
                  "w-full bg-secondary rounded-lg p-3 mb-3 text-left transition-colors hover:bg-transparent block h-auto data-[state=on]:bg-accent hover:data-[state=on]:bg-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <span>
                        <span className="mr-2">{linked.title}</span>
                        <span className="font-mono text-sm text-muted-foreground">
                          - {linked.identifier}
                        </span>
                      </span>
                      <Badge variant="blue">{linked.state.name}</Badge>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>
                        {linked.assignee?.email
                          ? `Assigned to ${linked.assignee?.email}`
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="link" className="relative mt-0">
              <LinkIssue task={task} onClose={disclosure.onClose} />
            </TabsContent>
            <TabsContent value="create" className="relative mt-0">
              <CreateIssue task={task} onClose={disclosure.onClose} />
            </TabsContent>
          </ModalBody>
        </Tabs>
      </ModalContent>
    </Modal>
  );
};
