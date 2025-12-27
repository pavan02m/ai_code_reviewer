"use server";

import {fetchUserContributions, getGithubToken} from "@/module/github/lib/github";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {Octokit} from "octokit";
import {username} from "better-auth/plugins";
import prisma from "@/lib/db";

export const getDashboardData = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();
        if (!token) {
            throw new Error("No GitHub token found");
        }

        const octokit = new Octokit({auth: token});
        const {data: user} = await octokit.rest.users.getAuthenticated();

        // Total Repositories
        const totalRepos = user.total_private_repos! + user.public_repos;

        //Calculate total commits from contribution calendar
        const calendarData = await fetchUserContributions(user.login, token);

        const totalCommits = calendarData.totalContributions || 0;

        //Fetch total PRs created by the user
        const{data:prs} = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            per_page: 1,
        });

        const totalPRs = prs.total_count || 0;

        //Count AI Reviews from our database
        const totalAiReviewsCount = await prisma.review.count({
            where :{
                repository : {
                    user :{
                        id: session?.user?.id,
                    }
                }
            }
        })

        return {
            totalCommits,
            totalRepos,
            totalPRs,
            totalAiReviewsCount,
        }
    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            totalCommits: 0,
            totalRepos: 0,
            totalPRs: 0,
            totalAiReviewsCount: 0,
        };
    }
}

export const getMonthlyActivity = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();
        if (!token) {
            throw new Error("No GitHub token found");
        }

        const octokit = new Octokit({auth: token});

        const {data: user} = await octokit.rest.users.getAuthenticated();

        const calendarData = await fetchUserContributions(user.login, token);

        if(!calendarData){
           return [];
        }

        const monthlyActivity: {[key:string]: {commits : number; prs : number; reviews: number;}} = {};

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const date = new Date();

        for(let i = 5; i >= 0; i--){
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const monthKey = monthNames[d.getMonth()];
            monthlyActivity[monthKey] = {commits:0, prs:0, reviews:0};
        }

        //Calculate commits per month
        calendarData.weeks.forEach(week => {
            week.contributionDays.forEach(day => {
                const dayDate = new Date(day.date);
                const monthKey = monthNames[dayDate.getMonth()];
                if(monthlyActivity[monthKey]){
                    monthlyActivity[monthKey].commits += day.contributionCount;
                }
            });
        });

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        //Fetch PRs and group by month
        const {data: prs} = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr created:>=${sixMonthsAgo.toISOString().split('T')[0]}`,
            per_page: 100,
        });

        prs.items.forEach(pr => {
            const prDate = new Date(pr.created_at);
            const monthKey = monthNames[prDate.getMonth()];
            if(monthlyActivity[monthKey]){
                monthlyActivity[monthKey].prs += 1;
            }
        });

       const sampleReviews = generateSampleReviewsPerMonth();
       sampleReviews.forEach(review => {
           if(monthlyActivity[review.month]){
               monthlyActivity[review.month].reviews = review.reviews;
           }
       });

        const result = Object.keys(monthlyActivity).map(month => ({
            month,
            commits: monthlyActivity[month].commits,
            prs: monthlyActivity[month].prs,
            reviews: monthlyActivity[month].reviews,
        }));

        return result;
    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        return [];
    }
}

const generateSampleReviewsPerMonth = () => {
    const sampleData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date();

    for(let i = 5; i >= 0; i--){
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const monthKey = monthNames[d.getMonth()];
        // Generate a random number of reviews between 0 and 50
        const reviewsCount = Math.floor(Math.random() * 51);
        sampleData.push({month: monthKey, reviews: reviewsCount});
    }

    return sampleData;
}
export async function getContributionStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();
        if (!token) {
            throw new Error("No GitHub token found");
        }

        // Get the actual GitHub username from the GitHub API
        const octokit = new Octokit({ auth: token });

        const { data: user } = await octokit.rest.users.getAuthenticated();
        const username = user.login;

        const calendar = await fetchUserContributions(username, token);

        if (!calendar) {
            return null;
        }

        const contributions = calendar.weeks.flatMap((week: any) =>
            week.contributionDays.map((day: any) => ({
                date: day.date,
                count: day.contributionCount,
                level: Math.min(4, Math.floor(day.contributionCount / 3)), // Convert to 0-4 scale
            }))
        )

        return {
            contributions,
            totalContributions:calendar.totalContributions
        }

    } catch (error) {
        console.error("Error fetching contribution stats:", error);
        return null;
    }
}
