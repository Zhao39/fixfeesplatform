import type { LinearTeam, LinearUser } from "@carbon/ee/linear";
import { tiptapToMarkdown } from "@carbon/ee/linear";
import { Hidden, Input, Select } from "@carbon/form";
import type { JSONContent } from "@carbon/react";
import { Button, Label, ModalFooter, VStack } from "@carbon/react";
import { Editor } from "@carbon/react/Editor";
import { useEffect, useId, useMemo, useState } from "react";
import { useAsyncFetcher } from "~/hooks/useAsyncFetcher";
import type { IssueActionTask } from "~/modules/quality";
import { path } from "~/utils/path";

type Props = {
  task: IssueActionTask;
  onClose: () => void;
};

export const CreateIssue = (props: Props) => {
  const id = useId();
  const [team, setTeam] = useState<string | undefined>();
  const [assignee, setAssignee] = useState<string | undefined>();
  const [title, setTitle] = useState(props.task.name ?? "");
  const [description, setDescription] = useState<JSONContent>(
    (props.task.notes as JSONContent) ?? { type: "doc", content: [] }
  );

  const { teams, members, fetcher: teamFetcher } = useLinearTeams(team);
  const submitFetcher = useAsyncFetcher();

  const teamOptions = useMemo(
    () => teams.map((el) => ({ label: el.name, value: el.id })),
    [teams]
  );
  const membersOptions = useMemo(
    () => members.map((el) => ({ label: el.email, value: el.id })),
    [members]
  );

  const isSearching = teamFetcher.state === "loading";
  const isSubmitting = submitFetcher.state === "submitting";

  const handleSubmit = async () => {
    if (!team || !title.trim()) return;

    // Convert Tiptap JSON to markdown for Linear
    const descriptionMarkdown = tiptapToMarkdown(
      description as { type: "doc"; content: any[] }
    );

    await submitFetcher.submit(
      {
        actionId: props.task.id,
        teamId: team,
        title: title.trim(),
        description: descriptionMarkdown,
        assignee: assignee ?? "",
      },
      {
        method: "POST",
        action: path.to.api.linearCreateIssue,
      }
    );

    props.onClose();
  };

  return (
    <form id={id} onSubmit={(e) => e.preventDefault()}>
      <VStack spacing={4}>
        <Hidden name="actionId" value={props.task.id} />
        <Select
          isLoading={isSearching}
          label="Linear Team"
          name="teamId"
          placeholder="Select a team"
          value={team}
          onChange={(e) => setTeam(e?.value)}
          options={teamOptions}
        />
        <Input
          label="Title"
          name="title"
          placeholder="Issue title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="w-full">
          <Label className="mb-2">Description</Label>
          <Editor
            className="min-h-[150px] border rounded-md"
            initialValue={description}
            onChange={setDescription}
          />
        </div>
        <Select
          label="Assign To"
          name="assignee"
          placeholder="Select an assignee"
          isOptional
          value={assignee}
          onChange={(e) => setAssignee(e?.value)}
          options={membersOptions}
        />
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
        <Button
          type="submit"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!team || !title.trim()}
        >
          Create
        </Button>
      </ModalFooter>
    </form>
  );
};

CreateIssue.displayName = "CreateIssue";

const useLinearTeams = (teamId?: string) => {
  const fetcher = useAsyncFetcher<{
    teams: LinearTeam[];
    members: LinearUser[];
  }>();

  useEffect(() => {
    fetcher.load(
      path.to.api.linearCreateIssue + (teamId ? `?teamId=${teamId}` : "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  return {
    teams: fetcher.data?.teams || [],
    members: fetcher.data?.members || [],
    fetcher,
  };
};
