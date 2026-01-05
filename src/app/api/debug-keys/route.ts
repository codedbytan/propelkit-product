import { NextResponse } from "next/server";

export async function GET() {
    const eventKey = process.env.INNGEST_EVENT_KEY;
    const signingKey = process.env.INNGEST_SIGNING_KEY;

    return NextResponse.json({
        hasEventKey: !!eventKey,
        hasSigningKey: !!signingKey,
        eventKeyLength: eventKey?.length || 0,
        signingKeyLength: signingKey?.length || 0,
        eventKeyStart: eventKey?.substring(0, 5) || 'MISSING',
        signingKeyStart: signingKey?.substring(0, 12) || 'MISSING',
        allInngestVars: Object.keys(process.env)
            .filter(key => key.startsWith('INNGEST'))
            .map(key => key)
    });
}