import type { LinearIssue } from "@carbon/ee/linear";
import {
	Badge,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	ToggleGroup,
	ToggleGroupItem,
	useDebounce,
	VStack,
	type useDisclosure,
} from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import type { FC } from "react";
import React from "react";
import type { IssueActionTask } from "~/modules/quality/types";
import { path } from "~/utils/path";

import { Hidden, Input, ValidatedForm } from "@carbon/form";
import z from "zod";

const linkIssueValidator = z.object({
	actionId: z.string(),
	issueId: z.string(),
});

interface Props extends ReturnType<typeof useDisclosure> {
	task: IssueActionTask;
}

export const LinearIssueDialog: FC<Props> = (props) => {
	const ref = React.useRef<HTMLFormElement>(null);
	const [tab, setTab] = React.useState("link");
	const [issueId, setIssueId] = React.useState<string | undefined>();

	const fetcher = useFetcher<{ issues: LinearIssue[]; linked?: LinearIssue }>({ key: "linear-issue-link" });

	const issues = fetcher.data?.issues || [];

	return (
		<Modal
			open
			onOpenChange={(open) => {
				if (!open) {
					props.onClose();
				}
			}}
		>
			<ModalContent size={"xlarge"}>
				<Tabs value={tab} onValueChange={setTab} defaultValue="link">
					<ModalHeader className="mb-1 flex-row justify-between py-3">
						<div className="space-y-1">
							<ModalTitle>Link Linear Issue</ModalTitle>
							<ModalDescription>Search for an existing issue or create a new one</ModalDescription>
						</div>

						<TabsList className="max-w-max mb-4">
							<TabsTrigger value="link">Link Existing</TabsTrigger>
							<TabsTrigger value="create">Create New</TabsTrigger>
						</TabsList>
					</ModalHeader>
					<ModalBody>
						<TabsContent value="link" className="relative mt-0">
							<ValidatedForm
								method="post"
								formRef={ref}
								action={path.to.api.linearLinkExistingIssue}
								validator={linkIssueValidator}
								fetcher={fetcher}
								onSubmit={() => {
									props.onClose();
								}}
							>
								<Hidden name="actionId" value={props.task.id} />
								<Hidden name="issueId" value={issueId} />
								<VStack spacing={4}>
									<fetcher.Form
										className="w-full flex items-center gap-x-2"
										method="get"
										action={path.to.api.linearLinkExistingIssue}
									>
										<input name="actionId" type="hidden" value={props.task.id} className="sr-only" />
										<Input
											name="linear-query"
											type="search"
											autoComplete="off"
											placeholder="Search by linear issue title..."
											onChange={useDebounce((e) => fetcher.submit(e.target.form), 350)}
										/>
										<Button
											className="py-5"
											isLoading={fetcher.state !== "idle"}
											onClick={(e) => fetcher.submit(e.currentTarget.form)}
										>
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
												className={
													"w-full rounded-lg p-3 text-left transition-colors hover:bg-transparent block h-auto data-[state=on]:bg-accent hover:data-[state=on]:bg-accent"
												}
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
															<span>
																{issue.assignee?.email ? `Assigned to ${issue.assignee?.email}` : "Unassigned"}
															</span>
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
									<Button type="submit">Save</Button>
								</ModalFooter>
							</ValidatedForm>
						</TabsContent>

						<TabsContent value="create" className="relative mt-0">
							Create
						</TabsContent>
					</ModalBody>
				</Tabs>
			</ModalContent>
		</Modal>
	);
};
