"use client"

import * as React from "react"
import {useTheme} from "next-themes";
import {useQuery} from "@tanstack/react-query";
import {getContributionStats} from "@/module/dashboard/actions";
import {ActivityCalendar} from "react-activity-calendar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Spinner} from "@/components/ui/spinner";

export function ContributionChart() {
    const {theme} = useTheme();

    const {data , isLoading} = useQuery({
        queryKey: ['contribution-stats'],
        queryFn: async () => await getContributionStats(),
    });

    if(isLoading){
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Contribution Activity</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="flex items-center flex-col justify-center min-h-[400px]">
                        <Spinner className="size-6"/>
                        Loading contribution data...
                    </div>
                </CardContent>
            </Card>
        )
    }

    console.log(data)

    if(!data || !data.contributions.length){
        return (
            <div className="w-full flex flex-col items-center justify-center p-8">
                <div className="text-muted-foreground">
                    No contribution data available.
                </div>
            </div>
        )
    }


    return (

        <>
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Contribution Activity</CardTitle>
                    <CardDescription>{data.contributions.length} contributions</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                    <ActivityCalendar
                        data={data.contributions}
                        colorScheme={theme ==="dark" ?"dark":"light"}
                        blockSize={18}
                        blockMargin={4}
                        fontSize={16}
                        showMonthLabels
                        showWeekdayLabels
                    />
                </CardContent>
            </Card>
        </>
    )
}
