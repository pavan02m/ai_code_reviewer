import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useQuery} from "@tanstack/react-query";
import {getMonthlyActivity} from "@/module/dashboard/actions";
import {Spinner} from "@/components/ui/spinner";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";

const ActivityChart = () => {
    const {data , isLoading} = useQuery({
        queryKey: ['activity-chart-data'],
        queryFn: async () => await getMonthlyActivity(),
    });

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "var(--chart-1)",
        },
        mobile: {
            label: "Mobile",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Github Activity</CardTitle>
                <CardDescription>contributions</CardDescription>
            </CardHeader>
            <CardContent className="h-80 w-full flex flex-col items-center justify-center p-8">
                {isLoading ? (
                <Spinner className="size-6" />
                ) : (
                    <div className="h-80 w-full">
                        {/* Placeholder for the activity chart */}
                        <ChartContainer config={chartConfig}  className="aspect-auto h-full w-full">
                            <BarChart accessibilityLayer data={data || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                />
                                <YAxis />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <Legend />
                                <Bar dataKey="commits" name="Commits" fill="#8884d8" radius={4}/>
                                <Bar dataKey="prs" name="Pull Requests" fill="#82ca9d" radius={4} />
                                <Bar dataKey="reviews" name="AI Review" fill="#ffc658" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )
                }
            </CardContent>
        </Card>
    );
};

export default ActivityChart;