"use server";

import prisma from "@/lib/db";
import {getPullrequestDiff} from "@/module/github/lib/github";
import {inngest} from "@/inngest/client";

export const reviewPullRequest = async (owner : string, repo: string, prNumber:number) => {
    const repositories = await  prisma.repository.findFirst({
        where:{
            owner: owner,
            name: repo,
        },
        include:{
            user : {
                include: {
                    accounts:{
                        where:{
                            providerId:"github"
                        }
                    }
                }
            }
        }
    });

    try {

        if(!repositories){
            throw new Error("No repositories found please connect the repo");
        }

        const githubAccount = repositories.user.accounts[0];

        if(!githubAccount?.accessToken){
            throw new Error("Access token not found ");
        }

        const token = githubAccount.accessToken;

        const {title} = await getPullrequestDiff(token, owner, repo, prNumber);

        await inngest.send({
            name:"pr.preview.requested",
            data:{
                owner,
                repo,
                prNumber,
                userId: repositories.user.id
            }
        })


        return {
            success : true,
            message: "Successfully queued pull request"
        }
    } catch (error) {

        try {
            const repository = await prisma.repository.findFirst({
                where: {
                    owner,
                    name: repo,
                }
            })

            if(repository){
                await prisma.review.create({
                    data : {
                        repositoryId : repository.id,
                        prNumber,
                        prTitle: "Failed tp fetch PR",
                        prUrl : `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review : `Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
                        status : "Failed"
                    }
                })
            }
        } catch (error) {
            console.error("Failed to save error to the database", error);
        }
    }
}