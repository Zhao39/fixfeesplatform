// biome-ignore lint/suspicious/noShadowRestrictedNames: suppressed due to migration
import { Combobox, Hidden, Number, Select, ValidatedForm } from "@carbon/form";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  VStack
} from "@carbon/react";
import { useMemo } from "react";
import { issueValidator } from "~/services/models";
import type { JobMaterial } from "~/services/types";
import { useItems } from "~/stores";
import { path } from "~/utils/path";

export function IssueModal({
  operationId,
  material,
  onClose
}: {
  operationId: string;
  material?: JobMaterial;
  onClose: () => void;
}) {
  const [items] = useItems();
  const itemOptions = useMemo(() => {
    return items
      .filter((i) => !["Batch", "Serial"].includes(i.itemTrackingType))
      .map((item) => ({
        label: item.readableIdWithRevision,
        helper: item.name,
        value: item.id
      }));
  }, [items]);

  return (
    <Modal open onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Issue Material</ModalTitle>
          <ModalDescription>
            Manually add or subtract material from the required quantities.
          </ModalDescription>
        </ModalHeader>

        <ValidatedForm
          method="post"
          action={path.to.issue}
          onSubmit={onClose}
          validator={issueValidator}
          defaultValues={{
            materialId: material?.id ?? "",
            jobOperationId: operationId,
            itemId: material?.itemId ?? "",
            quantity:
              (material?.estimatedQuantity ?? 0) -
              (material?.quantityIssued ?? 0),
            adjustmentType: "Negative Adjmt."
          }}
        >
          <ModalBody>
            <Hidden name="jobOperationId" />
            <Hidden name="materialId" />
            {material?.id && (
              <Hidden name="adjustmentType" value="Negative Adjmt." />
            )}
            <VStack spacing={4}>
              <Combobox name="itemId" label="Item" options={itemOptions} />
              {!material?.id && (
                <Select
                  name="adjustmentType"
                  label="Adjustment Type"
                  options={[
                    {
                      label: "Add to Inventory",
                      value: "Positive Adjmt."
                    },
                    {
                      label: "Pull from Inventory",
                      value: "Negative Adjmt."
                    }
                  ]}
                />
              )}
              <Number name="quantity" label="Quantity" />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Issue
            </Button>
          </ModalFooter>
        </ValidatedForm>
      </ModalContent>
    </Modal>
  );
}
