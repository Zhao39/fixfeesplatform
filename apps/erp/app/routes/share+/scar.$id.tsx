import { assertIsPost, getCarbonServiceRole, success } from "@carbon/auth";
import type {
  JSONContent} from "@carbon/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  generateHTML,
  HStack,
  IconButton,
  useDebounce,
  useDisclosure,
  VStack,
} from "@carbon/react";

import { useMode } from "@carbon/remix";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { getSupplier } from "~/modules/purchasing";
import type {
  IssueActionTask,
  IssueInvestigationTask} from "~/modules/quality";
import {
  getIssueActionTasks,
  getIssueFromExternalLink,
  getIssueInvestigationTasks,
  nonConformanceTaskStatus,
  updateIssueTaskContent,
  updateIssueTaskStatus,
} from "~/modules/quality";
import { getCompany } from "~/modules/settings";
import { getExternalLink } from "~/modules/shared";
import { ErrorMessage } from "./quote.$id";
import { statusActions, TaskProgress } from "~/modules/quality/ui/Issue";
import { Editor } from "@carbon/react/Editor";
import { LuChevronRight } from "react-icons/lu";
import { useCallback, useRef, useState } from "react";
import { path } from "~/utils/path";
import { validationError, validator } from "@carbon/form";
import z from "zod";
import { zfd } from "zod-form-data";
import { flash } from "@carbon/auth/session.server";

export const meta = () => {
  return [{ title: "Digital Quote" }];
};

enum IssueState {
  Valid,
  NotFound,
}

const translations = {
  en: {
    "Issue not found": "Issue not found",
    "Oops! The link you're trying to access is not valid.":
      "Oops! The link you're trying to access is not valid.",
  },
  es: {
    "Issue not found": "No se encontró el problema",
    "Oops! The link you're trying to access is not valid.":
      "¡Ups! El enlace al que intenta acceder no es válido.",
  },
  de: {
    "Issue not found": "Problem nicht gefunden",
    "Oops! The link you're trying to access is not valid.":
      "Ups! Der Link, den Sie aufrufen möchten, ist nicht gültig.",
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    return json({
      state: IssueState.NotFound,
      data: null,
      strings: translations.en,
    });
  }
  const locale = (request.headers.get("Accept-Language") || "en-US").substring(
    0,
    2
  );
  const strings =
    translations[locale as keyof typeof translations] || translations.en;

  const serviceRole = getCarbonServiceRole();
  const externalLink = await getExternalLink(serviceRole, id);
  if (!externalLink.data || !externalLink.data?.documentId) {
    return json({
      state: IssueState.NotFound,
      data: null,
      strings,
    });
  }

  const issue = await getIssueFromExternalLink(
    serviceRole,
    externalLink.data.documentId
  );
  if (!issue.data) {
    return json({
      state: IssueState.NotFound,
      data: null,
      strings,
    });
  }

  const [company, supplier, actionTasks, investigationTasks] =
    await Promise.all([
      getCompany(serviceRole, externalLink.data.companyId),
      getSupplier(serviceRole, issue.data.supplierId),
      getIssueActionTasks(
        serviceRole,
        issue.data.nonConformanceId,
        externalLink.data.companyId,
        issue.data.supplierId
      ),
      getIssueInvestigationTasks(
        serviceRole,
        issue.data.nonConformanceId,
        externalLink.data.companyId,
        issue.data.supplierId
      ),
    ]);

  return json({
    state: IssueState.Valid,
    data: {
      issue: issue.data.nonConformance,
      company: company.data,
      supplier: supplier.data,
      actionTasks: actionTasks.data,
      investigationTasks: investigationTasks.data,
    },
    strings,
  });
}

export const scarValidator = z.object({
  taskId: zfd.text(z.string()),
  type: z.enum(["action", "investigation"]),
  supplierId: zfd.text(z.string()),
  status: z.enum(nonConformanceTaskStatus).optional(),
  content: z
    .string()
    .optional()
    .transform((str, ctx) => {
      if (!str) {
        return;
      }
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({ code: "custom", message: "Invalid JSON" });
        return z.NEVER;
      }
    }),
});

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const serviceRole = getCarbonServiceRole();

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  const externalLink = await getExternalLink(serviceRole, id);
  if (!externalLink.data || !externalLink.data?.documentId) {
    throw new Error("Could not find id");
  }

  const issue = await getIssueFromExternalLink(
    serviceRole,
    externalLink.data.documentId
  );
  if (!issue.data) {
    throw new Error("Could not find the issue");
  }

  if (issue.data.nonConformance.status === "Closed") {
    throw new Error("Issue has been closed already. Unable to make changes");
  }
  const formData = await request.formData();
  const validation = await validator(scarValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const tasks =
    validation.data.type === "action"
      ? await getIssueActionTasks(
          serviceRole,
          issue.data.nonConformanceId,
          externalLink.data.companyId,
          issue.data.supplierId
        )
      : await getIssueInvestigationTasks(
          serviceRole,
          issue.data.nonConformanceId,
          externalLink.data.companyId,
          issue.data.supplierId
        );

  const isTaskValid = tasks.data?.find((t) => t.id === validation.data.taskId);
  if (!isTaskValid) {
    throw new Error("Invalid task id");
  }

  if (validation.data.status) {
    await updateIssueTaskStatus(serviceRole, {
      id: validation.data.taskId,
      status: validation.data.status,
      type: validation.data.type,
    });
  }

  if (validation.data.content) {
    await updateIssueTaskContent(serviceRole, {
      id: validation.data.taskId,
      content: validation.data.content,
      type: validation.data.type,
    });
  }

  throw redirect(
    path.to.externalScar(id),
    await flash(request, success("Updated issue"))
  );
}

const Header = ({
  company,
  issue,
  supplier,
}: {
  company: IssueData["company"];
  issue: IssueData["issue"];
  supplier: IssueData["supplier"];
}) => (
  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-start justify-between space-y-4 sm:space-y-2 pb-7">
    <div className="flex items-center space-x-4">
      <div>
        <CardTitle className="text-3xl">{company?.name ?? ""}</CardTitle>
        {issue?.nonConformanceId && (
          <p className="text-lg text-muted-foreground">
            {issue.nonConformanceId}
          </p>
        )}
        {issue?.name && (
          <p className="text-lg text-muted-foreground">{issue.name}</p>
        )}
      </div>
    </div>
    <div className="flex flex-col gap-2 items-end justify-start">
      <p className="text-xl font-medium">{supplier?.name ?? ""}</p>
    </div>
  </CardHeader>
);

function useTaskStatus({
  task,
  type,
  onChange,
}: {
  task: {
    id?: string;
    status: IssueInvestigationTask["status"];
    supplierId: string | null;
  };
  type: "investigation" | "action" | "approval" | "review";
  onChange?: (status: IssueInvestigationTask["status"]) => void;
}) {
  const { id } = useParams();
  if (!id) throw new Error("Could not find external quote id");

  const submit = useSubmit();

  const onOperationStatusChange = useCallback(
    (taskId: string, status: IssueInvestigationTask["status"]) => {
      onChange?.(status);
      submit(
        {
          taskId,
          status,
          type,
          supplierId: task.supplierId ?? "",
        },
        {
          method: "post",
          action: path.to.externalScar(id),
          navigate: false,
          fetcherKey: `externalScar:${id}`,
        }
      );
    },
    [onChange, task.supplierId, type, id, submit]
  );

  const currentStatus = task.status;

  return {
    currentStatus,
    onOperationStatusChange,
  };
}

function useTaskNotes({
  initialContent,
  taskId,
  supplierId,
  type,
}: {
  initialContent: JSONContent;
  taskId: string;
  supplierId: string;
  type: "investigation" | "action" | "approval" | "review";
}) {
  const { id } = useParams();
  if (!id) throw new Error("Could not find external quote id");

  const submit = useSubmit();
  const [content, setContent] = useState(initialContent ?? {});

  const onUploadImage = async (file: File) => {
    // const fileType = file.name.split(".").pop();
    // const fileName = `${companyId}/parts/${nanoid()}.${fileType}`;

    // const result = await carbon?.storage.from("private").upload(fileName, file);

    // if (result?.error) {
    //   toast.error("Failed to upload image");
    //   throw new Error(result.error.message);
    // }

    // if (!result?.data) {
    //   throw new Error("Failed to upload image");
    // }

    // return getPrivateUrl(result.data.path);
    return "";
  };

  // const table = getTable(type);

  const onUpdateContent = useDebounce(
    async (content: JSONContent) => {
      await submit(
        {
          taskId,
          type,
          supplierId,
          content: JSON.stringify(content),
        },
        {
          method: "post",
          action: path.to.externalScar(id),
          navigate: false,
          fetcherKey: `externalScar:${taskId}`,
        }
      );
    },
    2500,
    true
  );

  return {
    content,
    setContent,
    onUpdateContent,
    onUploadImage,
  };
}

export function TaskItem({
  task,
  type,
  isDisabled = false,
}: {
  task: IssueInvestigationTask | IssueActionTask;
  type: "investigation" | "action" | "review";
  isDisabled?: boolean;
  permissionsOverride?: Permissions;
}) {
  // const permissions = usePermissions();
  const disclosure = useDisclosure({
    defaultIsOpen: true,
  });
  const { currentStatus, onOperationStatusChange } = useTaskStatus({
    task,
    type,
  });
  const statusAction = statusActions[currentStatus];
  const { content, setContent, onUpdateContent, onUploadImage } = useTaskNotes({
    initialContent: (task.notes ?? {}) as JSONContent,
    taskId: task.id!,
    type,
    supplierId: task.supplierId ?? "",
  });

  const hasStartedRef = useRef(false);

  const taskTitle =
    type === "investigation"
      ? (task as IssueInvestigationTask).name
      : (task as IssueActionTask).name;
  return (
    <div className="rounded-lg border w-full flex flex-col">
      <div className="flex w-full justify-between px-4 py-2 items-center">
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight">
            {taskTitle}
          </span>
        </div>
        <IconButton
          icon={<LuChevronRight />}
          variant="ghost"
          onClick={disclosure.onToggle}
          aria-label="Open task details"
          className={cn(disclosure.isOpen && "rotate-90")}
        />
      </div>

      {disclosure.isOpen && (
        <div className="px-4 py-2 rounded">
          {!isDisabled ? (
            <Editor
              className="w-full min-h-[100px]"
              initialValue={content}
              onUpload={onUploadImage}
              onChange={(value) => {
                setContent(value);
                onUpdateContent(value);

                // Auto-start issue when typing in task if issue status is "Registered"
                if (
                  task.status === "Pending" &&
                  !hasStartedRef.current &&
                  value?.content?.some((node: any) => node.content?.length > 0)
                ) {
                  hasStartedRef.current = true;
                  onOperationStatusChange(task.id, "In Progress");
                }
              }}
            />
          ) : (
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: generateHTML(content as JSONContent),
              }}
            />
          )}
        </div>
      )}
      <div className="bg-muted/30 border-t px-4 py-2 flex justify-end w-full">
        <HStack>
          <Button
            isDisabled={isDisabled}
            leftIcon={statusAction.icon}
            variant="secondary"
            size="sm"
            onClick={() => {
              onOperationStatusChange(task.id!, statusAction.status);
            }}
          >
            {statusAction.action}
          </Button>
        </HStack>
      </div>
    </div>
  );
}

export function TaskList({
  tasks,
  isDisabled,
  type,
}: {
  tasks: IssueActionTask[] | IssueInvestigationTask[];
  isDisabled: boolean;
  type: "action" | "investigation";
}) {
  if (tasks.length === 0) return null;

  return (
    <Card className="w-full" isCollapsible>
      <HStack className="justify-between w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === "action" ? "Actions" : "Investigations"}
          </CardTitle>
        </CardHeader>
        <TaskProgress tasks={tasks} />
      </HStack>
      <CardContent>
        <VStack spacing={3}>
          {tasks
            .sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                type={type}
                isDisabled={isDisabled}
              />
            ))}
        </VStack>
      </CardContent>
    </Card>
  );
}

const Issue = ({
  data,
  strings,
}: {
  data: IssueData;
  strings: (typeof translations)["en"];
}) => {
  const { company, issue, actionTasks, investigationTasks, supplier } = data;

  const { id } = useParams();
  if (!id) throw new Error("Could not find external quote id");

  const mode = useMode();
  const logo = mode === "dark" ? company?.logoDark : company?.logoLight;

  return (
    <VStack spacing={8} className="w-full items-center p-2 md:p-8">
      {logo && (
        <img
          src={logo}
          alt={company?.name ?? ""}
          className="w-auto mx-auto max-w-5xl"
        />
      )}
      <Card className="w-full max-w-5xl mx-auto gap-4">
        <Header company={company} issue={issue} supplier={supplier} />
        <CardContent className="gap-4">
          {investigationTasks?.length ? (
            <TaskList
              tasks={investigationTasks}
              type="investigation"
              isDisabled={issue.status === "Closed"}
            />
          ) : null}
          {actionTasks?.length ? (
            <TaskList
              tasks={actionTasks}
              type="action"
              isDisabled={issue.status === "Closed"}
            />
          ) : null}
        </CardContent>
      </Card>
    </VStack>
  );
};

type IssueData = NonNullable<
  Awaited<ReturnType<Awaited<ReturnType<typeof loader>>["json"]>>["data"]
>;

export default function ExternalQuote() {
  const { state, data, strings } = useLoaderData<typeof loader>();

  switch (state) {
    case IssueState.Valid:
      if (data) {
        // @ts-ignore
        return <Issue data={data as IssueData} strings={strings} />;
      }
      return (
        <ErrorMessage
          title={strings["Issue not found"]}
          message={
            strings["Oops! The link you're trying to access is not valid."]
          }
        />
      );
    case IssueState.NotFound:
      return (
        <ErrorMessage
          title={strings["Issue not found"]}
          message={
            strings["Oops! The link you're trying to access is not valid."]
          }
        />
      );
  }
}
