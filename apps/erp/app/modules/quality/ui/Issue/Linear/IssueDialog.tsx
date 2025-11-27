import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type useDisclosure,
} from "@carbon/react";
import type { FC } from "react";

interface Props extends ReturnType<typeof useDisclosure> {}

export const LinearIssueDialog: FC<Props> = (props) => {
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    >
      <ModalContent>
        <Tabs defaultValue="link">
          <ModalHeader>
            <ModalTitle className="mb-2">Sync action with Linear</ModalTitle>
            <TabsList className="max-w-max">
              <TabsTrigger value="link">Link Existing Issue</TabsTrigger>
              <TabsTrigger value="create">Create New Issue</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="relative mt-0"></TabsContent>
          </ModalHeader>
          <ModalBody></ModalBody>
        </Tabs>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              props.onClose();
            }}
          >
            Cancel
          </Button>
          <Button>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
