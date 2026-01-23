import {
  Badge,
  Checkbox,
  MenuIcon,
  MenuItem,
  useDisclosure
} from "@carbon/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import {
  LuCalendar,
  LuCircleCheck,
  LuDollarSign,
  LuFileText,
  LuPencil,
  LuTrash,
  LuUser,
  LuUsers
} from "react-icons/lu";
import { useNavigate } from "react-router";
import { EmployeeAvatar, Hyperlink, New, Table } from "~/components";
import ConfirmDelete from "~/components/Modals/ConfirmDelete";
import {
  useCurrencyFormatter,
  usePermissions,
  useUrlParams,
  useUser
} from "~/hooks";
import type { ApprovalRule } from "~/modules/approvals";
import { usePeople } from "~/stores";
import { path } from "~/utils/path";

type ApprovalRulesTableProps = {
  data: ApprovalRule[];
  count: number;
  documentType: "purchaseOrder" | "qualityDocument";
};

const ApprovalRulesTable = memo(
  ({ data, count, documentType }: ApprovalRulesTableProps) => {
    const [params] = useUrlParams();
    const navigate = useNavigate();
    const permissions = usePermissions();
    const user = useUser();
    const currencyFormatter = useCurrencyFormatter();
    const deleteDisclosure = useDisclosure();
    const [people] = usePeople();
    const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);

    const columns = useMemo<ColumnDef<ApprovalRule>[]>(() => {
      const baseColumns: ColumnDef<ApprovalRule>[] = [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink
              to={`${path.to.approvalRule(row.original.id!)}?${params.toString()}`}
            >
              <span className="font-medium text-sm">{row.original.name}</span>
            </Hyperlink>
          ),
          meta: {
            icon: <LuFileText />
          }
        },
        {
          accessorKey: "enabled",
          header: "Status",
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Checkbox isChecked={row.original.enabled ?? false} />
              <Badge variant={row.original.enabled ? "green" : "gray"}>
                {row.original.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          ),
          meta: {
            icon: <LuCircleCheck />,
            filter: {
              type: "static",
              options: [
                { value: "true", label: "Enabled" },
                { value: "false", label: "Disabled" }
              ]
            }
          }
        }
      ];

      if (documentType === "purchaseOrder") {
        baseColumns.push({
          id: "amountRange",
          header: "Amount Range",
          cell: ({ row }) => {
            const lower = currencyFormatter.format(
              row.original.lowerBoundAmount ?? 0
            );
            const upper = row.original.upperBoundAmount
              ? currencyFormatter.format(row.original.upperBoundAmount)
              : null;
            return (
              <span className="text-sm">
                {lower} {upper ? `- ${upper}` : "+"}
              </span>
            );
          },
          meta: {
            icon: <LuDollarSign />
          }
        });
      }

      baseColumns.push(
        {
          id: "approverGroups",
          header: "Approver Groups",
          cell: ({ row }) => {
            const groups = row.original.approverGroupIds ?? [];
            if (groups.length === 0)
              return <span className="text-muted-foreground text-sm">—</span>;
            return (
              <span className="text-sm">
                {groups.length} {groups.length === 1 ? "group" : "groups"}
              </span>
            );
          },
          meta: {
            icon: <LuUsers />,
            filter: {
              type: "fetcher",
              endpoint: path.to.api.groupsByType("employee"),
              transform: (
                data: {
                  groups: {
                    data: { id: string; name: string };
                    children: any[];
                  }[];
                } | null
              ) => {
                if (!data?.groups) return [];
                // Flatten tree structure
                const flattenGroups = (
                  groups: {
                    data: { id: string; name: string };
                    children: any[];
                  }[]
                ): { id: string; name: string }[] => {
                  const result: { id: string; name: string }[] = [];
                  groups.forEach((group) => {
                    result.push({
                      id: group.data.id,
                      name: group.data.name
                    });
                    if (group.children && group.children.length > 0) {
                      result.push(...flattenGroups(group.children));
                    }
                  });
                  return result;
                };
                const flatGroups = flattenGroups(data.groups);
                return flatGroups.map(({ id, name }) => ({
                  value: id,
                  label: name
                }));
              },
              isArray: true
            }
          }
        },
        {
          id: "defaultApprover",
          header: "Default Approver",
          cell: ({ row }) =>
            row.original.defaultApproverId ? (
              <EmployeeAvatar employeeId={row.original.defaultApproverId} />
            ) : (
              <span className="text-muted-foreground text-sm">—</span>
            ),
          meta: {
            icon: <LuUser />,
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name
              }))
            }
          }
        },
        {
          id: "createdBy",
          header: "Created By",
          cell: ({ row }) => (
            <EmployeeAvatar employeeId={row.original.createdBy} />
          ),
          meta: {
            icon: <LuUser />,
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name
              }))
            }
          }
        },
        {
          accessorKey: "createdAt",
          header: "Created At",
          cell: (item) => {
            const date = item.getValue<string>();
            return date ? new Date(date).toLocaleDateString() : "—";
          },
          meta: {
            icon: <LuCalendar />
          }
        }
      );

      return baseColumns;
    }, [documentType, currencyFormatter, people, params]);

    const renderContextMenu = useCallback(
      (row: ApprovalRule) => {
        const canDelete =
          permissions.can("update", "settings") && row.createdBy === user?.id;

        return (
          <>
            <MenuItem
              disabled={!permissions.can("update", "settings")}
              onClick={() => {
                navigate(
                  `${path.to.approvalRule(row.id!)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<LuPencil />} />
              Edit Rule
            </MenuItem>
            <MenuItem
              destructive
              disabled={!canDelete}
              onClick={() => {
                setSelectedRule(row);
                deleteDisclosure.onOpen();
              }}
            >
              <MenuIcon icon={<LuTrash />} />
              Delete Rule
            </MenuItem>
          </>
        );
      },
      [navigate, params, permissions, user, deleteDisclosure]
    );

    return (
      <>
        <Table<ApprovalRule>
          data={data}
          columns={columns}
          count={count}
          renderContextMenu={renderContextMenu}
          title={
            documentType === "purchaseOrder"
              ? "Purchase Order Approval Rules"
              : "Quality Document Approval Rules"
          }
          primaryAction={
            permissions.can("update", "settings") && (
              <New label="Rule" to={path.to.newApprovalRule(documentType)} />
            )
          }
        />
        {selectedRule?.id && (
          <ConfirmDelete
            action={path.to.deleteApprovalRule(selectedRule!.id)}
            isOpen={deleteDisclosure.isOpen}
            name={`${documentType === "purchaseOrder" ? "Purchase Order" : "Quality Document"} approval rule`}
            text={`Are you sure you want to delete this approval rule? This cannot be undone.`}
            onCancel={() => {
              deleteDisclosure.onClose();
              setSelectedRule(null);
            }}
            onSubmit={() => {
              deleteDisclosure.onClose();
              setSelectedRule(null);
            }}
          />
        )}
      </>
    );
  }
);

ApprovalRulesTable.displayName = "ApprovalRulesTable";
export default ApprovalRulesTable;
