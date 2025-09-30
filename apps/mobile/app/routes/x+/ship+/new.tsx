import { Combobox, Hidden, Select, ValidatedForm } from "@carbon/form";
import { VStack } from "@carbon/react";
import { useUser } from "~/hooks";
import {
  newShipmentValidator,
  shipmentSourceDocumentType,
} from "~/modules/ship/ship.models";

export default function NewShipmentsRoute() {
  const { defaults } = useUser();

  const initialValues = {
    id: undefined,
    locationId: defaults.locationId,
    sourceDocument: "Purchase Order",
    sourceDocumentId: "",
  };

  // let status = "Draft";

  // const permissions = usePermissions();
  // const {
  //   locationId,
  //   sourceDocuments,
  //   customerId,
  //   setLocationId,
  //   setSourceDocument,
  // } = useShipmentForm({ status, initialValues });

  // const isPosted = status === "Posted";
  // const isEditing = initialValues.id !== undefined;

  // const deleteDisclosure = useDisclosure();

  return (
    <div className="flex h-full flex-col max-w-lg mx-auto w-full p-2 gap-2 items-center justify-center">
      <ValidatedForm
        validator={newShipmentValidator}
        // @ts-ignore
        defaultValues={initialValues}
        className="w-full"
      >
        <Hidden name="locationId" />
        <VStack spacing={4}>
          <Select
            name="sourceDocument"
            label="Document"
            options={shipmentSourceDocumentType.map((v) => ({
              label: v,
              value: v,
            }))}
            size="lg"
            // onChange={(newValue) => {
            //   if (newValue) {
            //     setSourceDocument(
            //       newValue.value as (typeof shipmentSourceDocumentType)[number]
            //     );
            //   }
            // }}
            // isReadOnly={isPosted}
          />
          <Combobox
            name="sourceDocumentId"
            label="Document ID"
            options={[]}
            size="lg"
            // options={sourceDocuments.map((d) => ({
            //   label: d.name,
            //   value: d.id,
            // }))}
            // isReadOnly={isPosted}
          />
        </VStack>
      </ValidatedForm>
    </div>
  );
}
