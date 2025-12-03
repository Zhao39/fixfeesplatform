import {
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	type useDisclosure,
} from "@carbon/react";
import { useState } from "react";
import type { IssueActionTask } from "~/modules/quality/types";

import { CreateIssue } from "./CreateIssue";
import { LinkIssue } from "./LinkIssue";

interface Props extends ReturnType<typeof useDisclosure> {
	task: IssueActionTask;
}

export const LinearIssueDialog = (props: Props) => {
	const [tab, setTab] = useState("link");

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
							<LinkIssue task={props.task} onClose={props.onClose} />
						</TabsContent>
						<TabsContent value="create" className="relative mt-0">
							<CreateIssue task={props.task} onClose={props.onClose} />
						</TabsContent>
					</ModalBody>
				</Tabs>
			</ModalContent>
		</Modal>
	);
};
