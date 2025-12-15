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





