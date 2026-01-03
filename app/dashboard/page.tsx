'use client';
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getDashboardData , getMonthlyActivity } from "@/module/dashboard/actions";
import SectionCard from "@/module/dashboard/components/sectionCard";
import { ContributionChart} from "@/module/dashboard/components/chartAreaInteractive";
import ActivityChart from "@/module/dashboard/components/activity-chart";


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
                    <SectionCard stats={stats} />
                    <div className="px-4 lg:px-6">
                        <ContributionChart />
                    </div>
                    <div className="px-4 lg:px-6">
                        <ActivityChart />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default MainPage;