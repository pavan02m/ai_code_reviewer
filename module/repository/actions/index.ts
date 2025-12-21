"use server"
import prisma from "@/lib/db";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {createWebHook, getRepositories} from "@/module/github/lib/github";
import {randomUUID} from "node:crypto";
import {inngest} from "@/inngest/client";

export  const fetchRepositories = async (page: number = 1, perPage:number = 10) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const repositories = await getRepositories(page, perPage);

    const dbRepositories = await prisma.repository.findMany({
        where: {
            userId: session.user.id,
        }
    });

    const connectedReposSet = new Set(dbRepositories.map(repo => repo.githubId));

    return repositories.map((repository:any) => ({
        ...repository,
        isConnected: connectedReposSet.has(BigInt(repository.id)),
    }));
}

export const connectRepository = async (owner: string, repo: string, githubId: bigint) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const webHook = await createWebHook(owner, repo);
    if(webHook){
        await prisma.repository.create({
            data: {
                id: randomUUID(),
                githubId: BigInt(githubId),
                fullName: `${owner}/${repo}`,
                name: repo,
                owner: owner,
                userId: session.user.id,
                url:`https://github.com/${owner}/${repo}`,
            }
        });
    }

    // TODO : REPOSITORY COUNT TO UPDATE USAGE


    // TODO: TRIGGER REPOSITORY INDEXING FOR RAG()
    try {
        await inngest.send({
            name:"repository.connected",
            data:{
                owner,
                repo,
                userId: session.user.id
            }
        })
    } catch (error) {
        console.error("Failed to trigger repository indexing", error);
    }

    return webHook;
}