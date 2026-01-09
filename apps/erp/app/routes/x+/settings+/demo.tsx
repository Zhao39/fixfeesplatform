import { assertIsPost, error, success } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  ScrollArea,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack
} from "@carbon/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, useLoaderData } from "react-router";
import ConfirmDelete from "~/components/Modals/ConfirmDelete";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const handle: Handle = {
  breadcrumb: "Demo Data",
  to: path.to.demoData
};

interface DemoStatistics {
  entity: string;
  demoCount: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "settings"
  });

  // Get demo data counts for various entities
  const entities = [
    { name: "Items", table: "item" },
    { name: "Parts", table: "part" },
    { name: "Quotes", table: "quote" },
    { name: "Quote Lines", table: "quoteLine" },
    { name: "Purchase Orders", table: "purchaseOrder" },
    { name: "Purchase Order Lines", table: "purchaseOrderLine" },
    { name: "Customers", table: "customer" },
    { name: "Suppliers", table: "supplier" }
  ] as const;

  const statistics: DemoStatistics[] = [];

  for (const { name, table } of entities) {
    const { count: demoCount } = await client
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("companyId", companyId)
      .eq("isDemo", true);

    statistics.push({
      entity: name,
      demoCount: demoCount ?? 0
    });
  }

  const hasDemoData = statistics.some((s) => s.demoCount > 0);

  return {
    statistics,
    hasDemoData
  };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId } = await requirePermissions(request, {
    delete: "settings"
  });

  try {
    // Delete in order respecting foreign key constraints

    // 1. Get quote IDs for deletion of related records
    const { data: demoQuoteIds } = await client
      .from("quote")
      .select("id")
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 2. Get quote line IDs for deletion of quote line prices
    const { data: demoQuoteLineIds } = await client
      .from("quoteLine")
      .select("id")
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 3. Delete quote line prices
    if (demoQuoteLineIds && demoQuoteLineIds.length > 0) {
      await client
        .from("quoteLinePrice")
        .delete()
        .in(
          "quoteLineId",
          demoQuoteLineIds.map((r) => r.id)
        );
    }

    // 4. Delete quote lines
    await client
      .from("quoteLine")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 5. Delete quote shipments and payments
    if (demoQuoteIds && demoQuoteIds.length > 0) {
      await client
        .from("quoteShipment")
        .delete()
        .in(
          "id",
          demoQuoteIds.map((r) => r.id)
        );
      await client
        .from("quotePayment")
        .delete()
        .in(
          "id",
          demoQuoteIds.map((r) => r.id)
        );
    }

    // 6. Delete quotes
    await client
      .from("quote")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 7. Delete opportunities
    await client
      .from("opportunity")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 8. Get PO IDs for deletion of related records
    const { data: demoPOIds } = await client
      .from("purchaseOrder")
      .select("id")
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 9. Delete PO lines
    await client
      .from("purchaseOrderLine")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 10. Delete PO delivery and payment records
    if (demoPOIds && demoPOIds.length > 0) {
      await client
        .from("purchaseOrderDelivery")
        .delete()
        .in(
          "id",
          demoPOIds.map((r) => r.id)
        );
      await client
        .from("purchaseOrderPayment")
        .delete()
        .in(
          "id",
          demoPOIds.map((r) => r.id)
        );
    }

    // 11. Delete purchase orders
    await client
      .from("purchaseOrder")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 12. Delete supplier interactions
    await client
      .from("supplierInteraction")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 13. Delete materials
    await client
      .from("material")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 14. Delete parts
    await client
      .from("part")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 15. Delete items
    await client
      .from("item")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 16. Delete customers
    await client
      .from("customer")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    // 17. Delete suppliers
    await client
      .from("supplier")
      .delete()
      .eq("companyId", companyId)
      .eq("isDemo", true);

    return redirect(
      path.to.demoData,
      await flash(request, success("Demo data deleted successfully"))
    );
  } catch (err) {
    return data(
      {},
      await flash(request, error(err as Error, "Failed to delete demo data"))
    );
  }
}

export default function DemoDataSettings() {
  const { statistics, hasDemoData } = useLoaderData<typeof loader>();
  const deleteModal = useDisclosure();

  const totalDemoRecords = statistics.reduce((sum, s) => sum + s.demoCount, 0);

  return (
    <ScrollArea className="w-full h-[calc(100dvh-49px)]">
      <VStack
        spacing={4}
        className="py-12 px-4 max-w-[60rem] h-full mx-auto gap-4"
      >
        <Heading size="h3">Demo Data</Heading>

        <Card>
          <CardHeader>
            <CardTitle>Demo Data Statistics</CardTitle>
            <CardDescription>
              Overview of demo data in your company. Demo data is marked with a
              special flag and can be deleted without affecting your real data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Entity</Th>
                  <Th className="text-right">Demo Records</Th>
                </Tr>
              </Thead>
              <Tbody>
                {statistics.map((stat) => (
                  <Tr key={stat.entity}>
                    <Td>{stat.entity}</Td>
                    <Td className="text-right">
                      {stat.demoCount > 0 ? (
                        <span className="text-orange-500 font-medium">
                          {stat.demoCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </Td>
                  </Tr>
                ))}
                <Tr className="font-semibold border-t-2">
                  <Td>Total</Td>
                  <Td className="text-right">
                    {totalDemoRecords > 0 ? (
                      <span className="text-orange-500">
                        {totalDemoRecords}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Demo Data</CardTitle>
            <CardDescription>
              Permanently delete all demo data from your company. This action
              cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              isDisabled={!hasDemoData}
              onClick={deleteModal.onOpen}
            >
              Delete All Demo Data
            </Button>
            {!hasDemoData && (
              <p className="text-sm text-muted-foreground mt-2">
                No demo data to delete.
              </p>
            )}
          </CardContent>
        </Card>
        {deleteModal.isOpen && (
          <ConfirmDelete
            isOpen={deleteModal.isOpen}
            name="Demo Data"
            text={`Are you sure you want to delete all ${totalDemoRecords} demo records? This action cannot be undone.`}
            onCancel={deleteModal.onClose}
            onSubmit={deleteModal.onClose}
          />
        )}
      </VStack>
    </ScrollArea>
  );
}
