'use client';
import React from 'react';
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GitCommit, GitPullRequest, MessageSquare, GitBranch } from "lucide-react"
import { useQuery } from "@tanstack/react-query";
import { getDashboardData , getMonthlyActivity } from "@/module/dashboard/actions";


const MainPage = () => {
    const { data: stats , isLoading} = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => await getDashboardData(),
        refetchOnWindowFocus: false,
    });

    const { data: monthlyActivity , isLoading: isActivityLoading} = useQuery({
        queryKey: ['monthly-activity'],
        queryFn: async () => await getMonthlyActivity(),
        refetchOnWindowFocus: false,
    });


    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total Repositories</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats?.totalRepos ?? '...'}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Increased by 15% since last month
                                </div>
                                <div className="text-muted-foreground">
                                    Steady growth observed
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total Commits</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats?.totalCommits ?? '...'}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Slight decrease in commit activity
                                </div>
                                <div className="text-muted-foreground">
                                    Review collaboration needed
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total Pull Requests</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats?.totalPRs ?? '...'}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    High volume of PRs created
                                </div>
                                <div className="text-muted-foreground">
                                    Engagement exceed targets
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total AI Reviews</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats?.totalAiReviewsCount ?? '...'}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Consistent usage of AI reviews
                                </div>
                                <div className="text-muted-foreground">
                                    Positive feedback received
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default MainPage;