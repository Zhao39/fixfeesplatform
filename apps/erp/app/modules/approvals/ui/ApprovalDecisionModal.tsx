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
import { useEffect, useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
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
  const revalidator = useRevalidator();
  const [notes, setNotes] = useState("");

  const isApproving = decisionType === "approve";
  const isSubmitting = fetcher.state !== "idle";

  // Close modal and refresh on successful submission
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // Check if the response indicates success
      if (fetcher.data.success) {
        onClose();
        // Revalidate the data to refresh the table
        revalidator.revalidate();
      }
      // If there's a validation error (fieldErrors), it will be handled by the form
      // If there's an error message, we should show it (but the modal will stay open)
    }
  }, [fetcher.state, fetcher.data, onClose, revalidator]);

  const handleSubmit = () => {
    if (!approval.id) {
      console.error("Approval ID is missing");
      return;
    }

    const formData = new FormData();
    formData.append("id", approval.id);
    formData.append("decision", isApproving ? "Approved" : "Rejected");
    if (notes) {
      formData.append("decisionNotes", notes);
    }

    fetcher.submit(formData, {
      method: "post",
      action: path.to.approvalDecision(approval.id)
    });
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {isApproving ? "Approve Request" : "Reject Request"}
          </ModalTitle>
          <ModalDescription>
            {isApproving
              ? `Are you sure you want to approve ${approval.documentReadableId ?? approval.documentId}?`
              : `Are you sure you want to reject ${approval.documentReadableId ?? approval.documentId}?`}
          </ModalDescription>
          <ModalClose onClick={onClose} disabled={isSubmitting} />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <div className="w-full">
              <label
                htmlFor="decisionNotes"
                className="text-sm font-medium text-muted-foreground mb-2 block"
              >
                Notes (optional)
              </label>
              <Textarea
                id="decisionNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                rows={4}
                disabled={isSubmitting}
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
