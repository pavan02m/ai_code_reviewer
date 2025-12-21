import {NextResponse, NextRequest} from 'next/server';
import {reviewPullRequest} from "@/module/ai/actions";

export async function POST(request: NextRequest) {
    try {
        const body= await request.json();

        const event = request.headers.get('x-github-event');

        console.log("Event Received:", event);

        // Handle different GitHub events
        if (event === 'ping') {
            return NextResponse.json({msg: 'pong', status: 200});
        }

        if(event === "pull_request") {
            const action = body.action;
            const repo = body.repository.full_name;
            const pr_number = body.number;

            const [owner, repoName] = repo.split('/');

            if(action === "opened" || action === "synchronize") {
                reviewPullRequest(owner, repoName, pr_number)
                    .then(() => {
                        console.log(`Review completed for ${repo} #${pr_number}`);
                    })
                    .catch((e) => {
                        console.error(`Error occurred while reviewing ${repo} #${pr_number}: ${e}`);
                    })
            }
        }

        // TODO: Add handling for other GitHub events like push, pull_request, etc.

        return NextResponse.json({msg: 'Event received', status: 200});

    } catch(error) {
        console.error('Error handling GitHub webhook:', error);
        return NextResponse.json({msg: 'Internal Server Error', status: 500});
    }
}