"use server";

import prisma from "@/lib/db";
import {getPullrequestDiff} from "@/module/github/lib/github";

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

    if(!repositories){
        throw new Error("No repositories found please connect the repo");
    }

    const githubAccount = repositories.user.accounts[0];

    if(!githubAccount?.accessToken){
        throw new Error("Access token not found ");
    }

    const token = githubAccount.accessToken;

    const {title} = await getPullrequestDiff(token, owner, repo, prNumber);


}