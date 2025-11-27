import axios, { type AxiosInstance } from "axios";
import { getLinearIntegration } from "./service";
import { getCarbonServiceRole } from "@carbon/auth";

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
    apiKey: string,
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
      headers: await this.getAuthHeaders(apiKey),
      data: {
        query,
        variables,
      },
    });

    return response;
  }
}
