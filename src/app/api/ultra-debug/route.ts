// src/app/api/ultra-debug/route.ts
// FIXED - No TypeScript errors

import { NextResponse } from "next/server";

export async function GET() {
    // Get environment variables
    const eventKey = process.env.INNGEST_EVENT_KEY;
    const signingKey = process.env.INNGEST_SIGNING_KEY;

    return NextResponse.json({
        // Environment Check
        environment: {
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
        },

        // Keys Check
        keys: {
            eventKey: {
                exists: !!eventKey,
                length: eventKey?.length || 0,
                firstChars: eventKey?.substring(0, 8) || 'MISSING',
                lastChars: eventKey?.substring(eventKey.length - 4) || 'MISSING',
                startsWithNumber: eventKey ? /^[0-9]/.test(eventKey) : false,
                looksCorrect: eventKey && eventKey.length >= 25 && eventKey.length <= 40,
            },
            signingKey: {
                exists: !!signingKey,
                length: signingKey?.length || 0,
                firstChars: signingKey?.substring(0, 15) || 'MISSING',
                lastChars: signingKey?.substring(signingKey.length - 4) || 'MISSING',
                startsWithSignkey: signingKey?.startsWith('signkey-prod-') || false,
                looksCorrect: signingKey?.startsWith('signkey-prod-') || false,
            }
        },

        // All INNGEST env vars
        allInngestVars: Object.keys(process.env)
            .filter(key => key.includes('INNGEST'))
            .reduce((acc, key) => {
                const value = process.env[key];
                acc[key] = {
                    length: value?.length || 0,
                    firstChars: value?.substring(0, 10) || 'MISSING',
                    exists: !!value
                };
                return acc;
            }, {} as Record<string, any>),

        // Expected Values
        expected: {
            eventKey: {
                format: 'Should start with number (like 01H, 02A, etc)',
                length: '~25-35 characters',
                example: '01H8X9Y2Z3ABC4DEF5GH6JK7LM8'
            },
            signingKey: {
                format: 'Must start with: signkey-prod-',
                length: '~40-80 characters',
                example: 'signkey-prod-abc123xyz789...'
            }
        },

        // Diagnosis
        diagnosis: {
            eventKeyOK: eventKey && eventKey.length >= 25 && eventKey.length <= 40,
            signingKeyOK: signingKey?.startsWith('signkey-prod-') || false,
            bothKeysPresent: !!eventKey && !!signingKey,
            likelyProblem: !eventKey ? 'EVENT_KEY_MISSING' :
                !signingKey ? 'SIGNING_KEY_MISSING' :
                    !signingKey.startsWith('signkey-prod-') ? 'SIGNING_KEY_WRONG_FORMAT' :
                        eventKey.length > 40 || eventKey.length < 25 ? 'EVENT_KEY_WRONG_LENGTH' :
                            'CHECK_ROUTE_HAS_SIGNINGKEY_PARAMETER'
        },

        // Timestamp
        timestamp: new Date().toISOString(),
    });
}