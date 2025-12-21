import {Octokit} from 'octokit';
import {auth} from '@/lib/auth'
import prisma from "@/lib/db";
import {headers} from "next/headers";

export const getGithubToken = async (): Promise<string | null> => {
    const session = await auth.api.getSession({
            headers: await headers()

    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: 'github',
        },
    });

    if(!account?.accessToken){
        throw new Error("No gitHub access token found");
    }

    return account.accessToken;
}

export const fetchUserContributions = async (username: string, token: string) => {
    const octokit = new Octokit({auth: token});

    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

    interface ContributionData{
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: {
                        contributionDays: {
                            date: Date | string;
                            contributionCount: number;
                            color: string;
                        }[];
                    }[];
                };
            };
        };
    }

    try {
        const response: ContributionData = await octokit.graphql(query, {username});

        return response.user.contributionsCollection.contributionCalendar;
    }
    catch (error) {
        console.error("Error fetching user contributions:", error);
        throw error;
    }
}

export const getRepositories = async (page: number = 1, perPage: number = 10) => {
    const token = await getGithubToken();

    const {data} = await (new Octokit({auth: token})).rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        direction: 'desc',
        page: page,
        per_page: perPage,
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
    });

    return data;
}

export const createWebHook = async (owner : string, repo: string) => {
    const token = await getGithubToken();

    const octokit = new Octokit({auth: token});

    const webHookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`;

    const {data : hooks} = await octokit.rest.repos.listWebhooks({
        owner,
        repo,
    });

    const existingWebHookURL = hooks.find(hook => hook.config.url === webHookURL);

    if(existingWebHookURL){
        return existingWebHookURL;
    }

    const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
            url: webHookURL,
            content_type: 'json',
        },
        events: ['pull_request', 'push', 'pull_request_review'],
    });

    return data;
}

export const deleteWebHook = async (owner : string, repo: string) => {

    const token = await getGithubToken();

    const octokit = new Octokit({auth: token});

    const webHookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`;

    const {data : hooks} = await octokit.rest.repos.listWebhooks({
        owner,
        repo,
    });

    const hookToDelete = hooks.find(hook => hook.config.url === webHookURL);

    if(hookToDelete){
        await octokit.rest.repos.deleteWebhook({
            owner,
            repo,
            hook_id: hookToDelete.id,
        });

        return true;
    }

    return false;
}







