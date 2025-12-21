"use server";

import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {deleteWebHook} from "@/module/github/lib/github";


export const getUserProfile = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return user;
    } catch (e) {
        console.error(e);
    }
}

export const updateUserProfile = async (data:{name?: string, email? : string}) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name: data.name,
                email: data.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        // Revalidate the profile page to reflect changes
        revalidatePath('/dashboard/settings', 'page');

        return {
            success: true,
            user: updatedUser,
        }
    } catch (error) {
        console.error(error);
    }
}

export const getConnectedRepositories = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        const repositories = await prisma.repository.findMany({
            where: {
                userId: session.user.id,
            },
            select:{
                id: true,
                owner: true,
                name: true,
                fullName: true,
                url:true,

                createdAt:true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return repositories;

    } catch (error) {
        console.error("Error in fetching connected repos", error);
        return [];
    }

}

export const disconnectRepository = async (respositoryId : string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if(!session?.user) {
            throw new Error("Unauthorized");
        }

        // Implement the logic to disconnect the repository here
        const repository = await prisma.repository.findUnique({
            where: {
                id: respositoryId,
                userId: session.user.id,
            },
        })

        if(!repository) {
            throw new Error("Repository not found");
        }

        await deleteWebHook(repository.owner, repository.name);

        await prisma.repository.delete({
            where: {
                id: respositoryId,
            },
        });
        // Revalidate the connected repositories page to reflect changes
        revalidatePath('/dashboard/settings', 'page');
        revalidatePath('/dashboard/repository', 'page');

        return {success: true};

    } catch (error: any) {
        console.error("Error disconnecting repository:");
        console.error(error);
        return {success: false, message: "Error disconnecting repository"};
    }
}

export const disconnectAllRepositories = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const repositories = await prisma.repository.findMany({
            where: {
                userId: session.user.id,
            },
        });

        for(const repository of repositories) {
            await deleteWebHook(repository.owner, repository.name);
        }

        await prisma.repository.deleteMany({
            where: {
                userId: session.user.id,
            },
        });

        // Revalidate the connected repositories page to reflect changes
        revalidatePath('/dashboard/settings', 'page');
        revalidatePath('/dashboard/repository', 'page');

        return {success: true};
    }
    catch (error: any) {
        console.error("Error disconnecting all repositories:");
        console.error(error);
        return {success: false, message: "Error disconnecting all repositories"};
    }
}
