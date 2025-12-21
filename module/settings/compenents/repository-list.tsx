"use client";

import React from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {disconnectAllRepositories, disconnectRepository, getConnectedRepositories} from "@/module/settings/actions";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {AlertTriangle, ExternalLink, Trash} from "lucide-react";
import {Badge} from "@/components/ui/badge";


export const RepositoryList = () => {
    const querClient = useQueryClient();
    const [disconnectAllOpen, setDisconnectAllOpen] = React.useState(false);

    const {data:repositories,  isLoading} = useQuery({
        queryKey:["connected-repositories"],
        queryFn: async () => {
            // Fetch connected repositories logic here
            return await getConnectedRepositories();
        },
        staleTime: 5000 * 60 * 2,
        refetchOnWindowFocus: false,
    });

    const disconnectMutation = useMutation({
        mutationFn: async (repoId: string) => {
            // Disconnect repository logic here
            return await disconnectRepository(repoId);
        },
        onSuccess: () => {
            querClient.invalidateQueries({queryKey: ['connected-repositories']});
            querClient.invalidateQueries({queryKey: ['dashboard-stats']});
            toast.success(`Repository disconnected successfully.`);
        },
        onError: (error: any) => {
            toast.error("Failed to disconnect repository");
            console.error(error.message());
        }
    });

    const disconnectAlltMutation = useMutation({
        mutationFn: async () => {
            // Disconnect repository logic here
            await disconnectAllRepositories();
            setDisconnectAllOpen(true);
        },
        onSuccess: () => {
            querClient.invalidateQueries({queryKey: ['connected-repositories']});
            querClient.invalidateQueries({queryKey: ['dashboard-stats']});
            toast.success(`Repository disconnected successfully.`);
        },
        onError: (error: any) => {
            toast.error("Failed to disconnect repository");
            console.error(error.message());
        }
    });


    return (
        <Card className="mt-5">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>
                            Connected Repositories
                        </CardTitle>
                        <CardDescription>
                            Manage your connected repositories here.
                        </CardDescription>
                    </div>
                    {
                        repositories && repositories?.length > 0 && (
                            <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="cursor-pointer" size="sm">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Disconnect All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Disconnect All Repositories ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will disconnect all {repositories?.length} repositories
                                            and delete all associated AI reviews.
                                            This action can't be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => disconnectAlltMutation.mutate()}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                                            disabled={disconnectAlltMutation.isPending}
                                        >
                                            {
                                                disconnectAlltMutation.isPending ? "Disconnecting...." : "Disconnect All"
                                            }
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    }
                </div>
            </CardHeader>

            <CardContent>
                {
                    !repositories || repositories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>
                                No Repository connected yet.
                            </p>
                            <p className="text-sm mt-2">

                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {
                                repositories.map((repository) => (
                                    <div
                                        key={repository.id}
                                        className="flex items-center justify-between gap-2 py-2 px-4 hover:bg-muted/50 transition-colors duration-1000">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">
                                                    {repository.name}
                                                </h3>
                                                <a
                                                    href={repository.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <ExternalLink className="w-4 h-4"/>
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" >
                                                    JavaScript
                                                    {/*{repository.language || 'Unknown'}*/}
                                                </Badge>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="cursor-pointer" size="sm">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                                        Disconnect Repository ?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will disconnect {repository.fullName} and delete all associated AI reviews.
                                                        This action can't be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => disconnectMutation.mutate(repository.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                                                        disabled={disconnectMutation.isPending}
                                                    >
                                                        {
                                                            disconnectMutation.isPending ? "Disconnecting...." : "Disconnect"
                                                        }
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </CardContent>
        </Card>
    );
};