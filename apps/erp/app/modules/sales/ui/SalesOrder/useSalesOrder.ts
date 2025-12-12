import { useCallback } from "react";
import { useNavigate } from "react-router";
import { path } from "~/utils/path";
import type { SalesOrder } from "../../types";

export const useSalesOrder = () => {
  const navigate = useNavigate();

  const edit = useCallback(
    (salesOrder: SalesOrder) => navigate(path.to.salesOrder(salesOrder.id!)),
    [navigate]
  );

  const invoice = useCallback(
    (salesOrder: SalesOrder) =>
      navigate(
        `${path.to.newSalesInvoice}?sourceDocument=Sales Order&sourceDocumentId=${salesOrder.id}`
      ),
    [navigate]
  );

  const ship = useCallback(
    (salesOrder: SalesOrder) =>
      navigate(
        `${path.to.newShipment}?sourceDocument=Sales Order&sourceDocumentId=${salesOrder.id}`
      ),
    [navigate]
  );

  return {
    edit,
    invoice,
    ship
  };
};
