import React, { useId } from "react";
import { Hidden, Input, Submit, ValidatedForm } from "@carbon/form";
import {
	Badge,
	Button,
	cn,
	ModalFooter,
	ToggleGroup,
	ToggleGroupItem,
	useDebounce,
	useMount,
	VStack,
} from "@carbon/react";
import { path } from "~/utils/path";
import z from "zod";
import { useAsyncFetcher } from "~/hooks/useAsyncFetcher";
import type { IssueActionTask } from "~/modules/quality";
import { LinearIssue } from "@carbon/ee/linear";

type Props = {
	task: IssueActionTask;
	onClose: () => void;
};

const linkIssueValidator = z.object({
	actionId: z.string(),
	issueId: z.string(),
});

export const LinkIssue = (props: Props) => {
	const id = React.useId();
	const [issueId, setIssueId] = React.useState<string | undefined>();

	const { issues, linked, fetcher, isSearching } = useLinearIssues();

	return (
		<ValidatedForm
			id={id}
			method="post"
			action={path.to.api.linearLinkExistingIssue}
			validator={linkIssueValidator}
			fetcher={fetcher}
		>
			<Hidden name="actionId" value={props.task.id} />
			<Hidden name="issueId" value={issueId} />
			<VStack spacing={4}>
				<fetcher.Form
					className="w-full flex items-center gap-x-2"
					method="get"
					action={path.to.api.linearLinkExistingIssue}
				>
					<Hidden name="actionId" value={props.task.id} />
					<Input
						name="linear-query"
						type="search"
						autoComplete="off"
						placeholder="Search by linear issue title..."
						onChange={useDebounce((e) => fetcher.submit(e.currentTarget.form), 350)}
					/>
					<Button className="py-5" isLoading={isSearching} onClick={(e) => fetcher.submit(e.currentTarget.form)}>
						Search
					</Button>
				</fetcher.Form>
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
		isSearching: fetcher.state === "loading",
		fetcher,
	};
};
