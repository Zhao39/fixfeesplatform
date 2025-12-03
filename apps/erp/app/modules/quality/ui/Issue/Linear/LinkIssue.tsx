import type { LinearIssue } from "@carbon/ee/linear";
import { Hidden, Submit, ValidatedForm } from "@carbon/form";
import {
  Badge,
  Button,
  cn,
  Input,
  ModalFooter,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  useDebounce,
  VStack,
} from "@carbon/react";
import { useId, useState } from "react";
import z from "zod";
import { useAsyncFetcher } from "~/hooks/useAsyncFetcher";
import type { IssueActionTask } from "~/modules/quality";
import { path } from "~/utils/path";

type Props = {
  task: IssueActionTask;
  onClose: () => void;
};

const linkIssueValidator = z.object({
  actionId: z.string(),
  issueId: z.string(),
});

export const LinkIssue = (props: Props) => {
  const id = useId();
  const [issueId, setIssueId] = useState<string | undefined>();

  const { issues, linked, fetcher, isSearching } = useLinearIssues();

  const onSearch = useDebounce((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || e.target.value.trim().length < 3) return;

    fetcher.load(path.to.api.linearLinkExistingIssue + `?actionId=${props.task.id}&search=${e.target.value}`);
  }, 300);

  return (
    <ValidatedForm
      id={id}
      method="post"
      action={path.to.api.linearLinkExistingIssue}
      validator={linkIssueValidator}
      fetcher={fetcher}
      resetAfterSubmit
      onSubmit={() => props.onClose()}
    >
      <Hidden name="actionId" value={props.task.id} />
      <Hidden name="issueId" value={issueId} />
      <VStack spacing={4}>
        <div className="w-full flex items-center gap-x-2 relative">
          <Input
            name="query"
            type="search"
            className="w-full"
            autoComplete="off"
            placeholder="Search by linear issue title..."
            onChange={onSearch}
            disabled={isSearching}
          />
          {isSearching && <Spinner className="w-5 h-5 absolute right-3.5 text-primary animate-spin" />}
        </div>
        <ToggleGroup
          orientation="vertical"
          onValueChange={setIssueId}
          value={issueId}
          type="single"
          className="w-full flex-col gap-y-2"
        >
          {issues.map((issue) => (
            <ToggleGroupItem
              key={issue.id}
              name="issueId"
              value={issue.id}
              variant={"outline"}
              className={cn(
                "w-full rounded-lg p-3 text-left transition-colors hover:bg-transparent block h-auto data-[state=on]:bg-accent hover:data-[state=on]:bg-accent",
                issue.id === linked?.id && "ring-primary ring-2"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-between">
                    <span>
                      <span className="mr-2">{issue.title}</span>
                      <span className="font-mono text-sm text-muted-foreground">- {issue.identifier}</span>
                    </span>
                    <Badge variant="blue">{issue.state.name}</Badge>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <span>{issue.assignee?.email ? `Assigned to ${issue.assignee?.email}` : "Unassigned"}</span>
                  </div>
                </div>
              </div>
            </ToggleGroupItem>
          ))}

          {issues.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground">No Linear issues found</p>
          )}
        </ToggleGroup>
      </VStack>
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={() => {
            props.onClose();
          }}
        >
          Cancel
        </Button>
        <Submit>Save</Submit>
      </ModalFooter>
    </ValidatedForm>
  );
};

LinkIssue.displayName = "LinkIssue";

const useLinearIssues = () => {
  const fetcher = useAsyncFetcher<{ issues: LinearIssue[]; linked?: LinearIssue }>();

  return {
    issues: fetcher.data?.issues || [],
    linked: fetcher.data?.linked || null,
    isSearching: fetcher.state !== "idle",
    fetcher,
  };
};
