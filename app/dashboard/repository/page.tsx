"use client";
import React from 'react';
import {useRepository} from "@/module/repository/hooks/use-repository";
import {ExternalLink, Loader, Search} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {RepositoryCardSkeleton, RepositoryListSkeleton} from "@/module/repository/components/repository-skeleton";
import {useConnectRepository} from "@/module/repository/hooks/use-connect-repository";

interface Repository {
    id: number;
    name: string;
    description: string | null;
    full_name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[] | [];
    isConnected: boolean;
}


const RepositoryPage = () => {

    const {data, isLoading, hasNextPage, isError, fetchNextPage, isFetchingNextPage} = useRepository();
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [localConnectingId, setLocalConnectingId] = React.useState<number | null>(null);
    const observerTarget = React.useRef<HTMLDivElement | null>(null);

    // USE CONNECT REPO
    const {mutate : connectRepo} = useConnectRepository();




    // Infinite Scroll Observer
    React.useEffect(() => {
        if (!observerTarget.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, {
            threshold: 0.1,
            rootMargin: '100px',
        });
        observer.observe(observerTarget.current);
        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [observerTarget, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return <RepositoryListSkeleton/>;
    }

    if(isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">
                    Failed to load repositories. Please try again later.
                </p>
            </div>
        );
    }

    const allRepositories: Repository[] = data ? data.pages.flatMap(page => page) : [];
    const filteredRepositories = allRepositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.full_name && repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );



    const handleConnectRepository = async (repository: Repository) => {
        setLocalConnectingId(repository.id);
        // Here you would call your server action to connect the repository
        connectRepo(
            {
                owner: repository.full_name.split("/")[0],
                repo: repository.name,
                githubId: BigInt(repository.id)
            },
            {
                onSettled: () => setLocalConnectingId(null)
            }
        )
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input
                    type="text"
                    placeholder="Search repositories..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="grid gap-3">
                {filteredRepositories.map((repository) => (
                    <Card
                        key={repository.id}
                        className="group border transition-colors hover:bg-muted/30"
                    >
                        <CardContent className="px-4 py-3">
                            <div className="flex items-start justify-between gap-4">
                                {/* LEFT */}
                                <div className="min-w-0">
                                    {/* Title row */}
                                    <div className="flex items-center gap-2 flex-wrap leading-tight">
                                        <h3 className="text-xl font-medium truncate leading-tight">
                                            {repository.name}
                                        </h3>

                                        <Badge variant="outline" className="text-xs h-5 px-2">
                                            {repository.language || "Unknown"}
                                        </Badge>

                                        {repository.isConnected ? (
                                            <Badge className="text-xs h-5 p-3 bg-emerald-500/10 text-emerald-600">
                                                Connected
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                Not connected
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {repository.description && (
                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                            {repository.description}
                                        </p>
                                    )}
                                </div>

                                {/* RIGHT */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        asChild
                                    >
                                        <a
                                            href={repository.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant={
                                            repository.isConnected
                                                ? "outline"
                                                : "default"
                                        }
                                        disabled={
                                            repository.isConnected ||
                                            localConnectingId === repository.id
                                        }
                                        onClick={() =>
                                            handleConnectRepository(repository)
                                        }
                                    >
                                        {localConnectingId === repository.id
                                            ? "Connecting…"
                                            : repository.isConnected
                                                ? "Connected"
                                                : "Connect"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div ref={observerTarget} className="py-4">
                {isFetchingNextPage && <RepositoryListSkeleton/>}
                {
                    !hasNextPage && allRepositories.length > 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            You have reached the end of the repository list.
                        </p>
                    )
                }
            </div>
        </div>
    );
};

export default RepositoryPage;