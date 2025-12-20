import {NextResponse, NextRequest} from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body= await request.body;

        const event = request.headers.get('x-github-event');

        console.log("Event Received:", event);

        // Handle different GitHub events
        if (event === 'ping') {
            return NextResponse.json({msg: 'pong', status: 200});
        }

        // TODO: Add handling for other GitHub events like push, pull_request, etc.

        return NextResponse.json({msg: 'Event received', status: 200});

    } catch(error) {
        console.error('Error handling GitHub webhook:', error);
        return NextResponse.json({msg: 'Internal Server Error', status: 500});
    }
}