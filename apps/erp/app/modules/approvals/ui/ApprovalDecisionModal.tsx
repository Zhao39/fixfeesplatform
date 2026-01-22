import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Textarea,
  VStack
} from "@carbon/react";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { ApprovalRequest } from "~/modules/approvals";
import { path } from "~/utils/path";

type ApprovalDecisionModalProps = {
  approval: ApprovalRequest;
  decisionType: "approve" | "reject";
  isOpen: boolean;
  onClose: () => void;
};

const ApprovalDecisionModal = ({
  approval,
  decisionType,
  isOpen,
  onClose
}: ApprovalDecisionModalProps) => {
  const fetcher = useFetcher();
  const [notes, setNotes] = useState("");

  const isApproving = decisionType === "approve";
  const isSubmitting = fetcher.state !== "idle";

  const handleSubmit = () => {
    fetcher.submit(
      {
        id: approval.id!,
        decision: isApproving ? "Approved" : "Rejected",
        decisionNotes: notes
      },
      {
        method: "post",
        action: path.to.approvalDecision
      }
    );
  };

  return (
    <Modal open={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {isApproving ? "Approve Request" : "Reject Request"}
          </ModalTitle>
          <ModalDescription>
            {isApproving
              ? `Are you sure you want to approve ${approval.documentReadableId}?`
              : `Are you sure you want to reject ${approval.documentReadableId}?`}
          </ModalDescription>
          <ModalClose onClick={onClose} />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <div className="w-full">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                rows={4}
              />
            </div>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={isApproving ? "primary" : "destructive"}
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {isApproving ? "Approve" : "Reject"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApprovalDecisionModal;
