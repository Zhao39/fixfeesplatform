import axios, { type AxiosInstance } from "axios";
import { getCarbonServiceRole } from "@carbon/auth";
import { getLinearIntegration } from "./service";

export interface LinearIssue {
	id: string;
	identifier: string;
	title: string;
	description?: string;
	state: {
		name: string;
		type: string;
	};
	assignee?: LinearUser;
	url?: string;
}

export interface LinearTeam {
	id: string;
	name: string;
}

interface LinearUser {
	email: string;
}
export class LinearClient {
	instance: AxiosInstance;

	constructor() {
		this.instance = axios.create({
			baseURL: "https://api.linear.app/graphql",
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	async getAuthHeaders(companyId: string) {
		const serviceRole = getCarbonServiceRole();

		const { data } = await getLinearIntegration(serviceRole, companyId);

		const integration = data?.[0];

		if (!integration) {
			throw new Error("Linear integration not found for company");
		}

		const metadata = integration.metadata as { apiKey: string };

		return {
			Authorization: metadata.apiKey,
		};
	}

	async createIssue(
		companyId: string,
		data: {
			title: string;
			description?: string;
			teamId: string;
			assigneeId?: string;
		}
	) {
		const query = `
         mutation CreateIssue($teamId: String!, $title: String!, $description: String, $assigneeId: String) {
            issueCreate(input: {
              teamId: $teamId
              title: $title
              description: $description
              assigneeId: $assigneeId
            }) {
              success
              issue {
                id
                identifier
                title
                description
                state {
                  name
                  type
                }
                assignee {
                  name
                  email
                  avatarUrl
                }
                dueDate
                cycle {
                  endsAt
                }
              }
            }
          }
      `;

		const variables = {
			...data,
			assigneeId: data.assigneeId || null,
		};

		// TODO: Type responses and improve error checking
		const response = await this.instance.request({
			method: "POST",
			headers: await this.getAuthHeaders(companyId),
			data: {
				query,
				variables,
			},
		});

		return response.data;
	}

	async listTeams(companyId: string) {
		const query = `query Teams { teams { nodes { id name } } }`;

		const response = await this.instance.request<{ data: { teams: { nodes: LinearTeam[] } } }>({
			method: "POST",
			headers: await this.getAuthHeaders(companyId),
			data: {
				query,
			},
		});

		return response.data.data.teams.nodes.map((el) => el);
	}

	async listIssues(companyId: string, input: string) {
		const query = `query SearchIssues($filter: IssueFilter!) { issues( filter: $filter first: 5 orderBy: updatedAt ) { nodes { id identifier title description state { name type color } assignee { email } } } }`;

		const response = await this.instance.request<{ data: { issues: { nodes: LinearIssue[] } } }>({
			method: "POST",
			headers: await this.getAuthHeaders(companyId),
			data: {
				query,
				variables: {
					filter: {
						title: { containsIgnoreCase: input },
					},
				},
			},
		});

		return response.data.data.issues.nodes.map((el) => el);
	}

	async getIssueById(companyId: string, issueId: string) {
		const query = `query SearchIssues($filter: IssueFilter!) { issues( filter: $filter first: 1 orderBy: updatedAt ) { nodes { id identifier title description state { name type color } assignee { email } } } }`;

		const response = await this.instance.request<{ data: { issues: { nodes: LinearIssue[] } } }>({
			method: "POST",
			headers: await this.getAuthHeaders(companyId),
			data: {
				query,
				variables: { filter: { id: { eq: issueId } } },
			},
		});

		return response.data.data.issues.nodes.at(0) || null;
	}
}
