"use client";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getUserProfile, updateUserProfile} from "@/module/settings/actions";
import {useState} from "react";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";

export const ProfileForm = () => {
    const queryClient = useQueryClient();

    const {data, isLoading} = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => await getUserProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const mutation = useMutation({
        mutationFn: async (updatedProfile: { name: string, email: string }) => {
            return await updateUserProfile(updatedProfile);
        },
        onSuccess: (data) => {
            if(data?.success) {
                toast.success("Profile updated successfully");
                queryClient.invalidateQueries({queryKey: ['user-profile']});
            }
        },
        onError: (error: any) => {
            toast.error(`Failed to update profile: ${error.message || error}`);
            console.error(error);
        }
    });

    if (isLoading) {
        return (
            <Card className="w-full mx-auto animate-pulse">
                {/* Header */}
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>

                {/* Content */}
                <CardContent>
                    <div className="flex flex-col gap-6">
                        {/* Name field */}
                        <div className="grid gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>

                        {/* Email field */}
                        <div className="grid gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex-col gap-2 w-60">
                    <Skeleton className="h-10 w-full rounded-md" />
                </CardFooter>
            </Card>
        );
    }

    if (data) {
        if (name === '') setName(data.name || '');
        if (email === '') setEmail(data.email || '');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({name, email});
    }

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2 w-60">
                <Button type="submit" className="w-full" onClick={handleSubmit}>
                    Update Profile
                </Button>
            </CardFooter>
        </Card>
    )
}