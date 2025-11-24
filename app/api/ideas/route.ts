/**
 * API Route: /api/ideas
 *
 * POST endpoint that generates content ideas based on style and number requested.
 *
 * Request body:
 * {
 *   "style": "allison" | "ines" | "rita" | "blend",
 *   "n": number (default: 10)
 * }
 *
 * Response:
 * {
 *   "ideas": Idea[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadAllProfiles } from '@/lib/profiles';
import { generateIdeas } from '@/lib/ideaEngine';
import {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  StyleType,
} from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateIdeasRequest = await request.json();

    // Validate inputs
    const style: StyleType = body.style || 'blend';
    const numIdeas = body.n || 10;

    // Validate style
    if (!['allison', 'ines', 'rita', 'blend'].includes(style)) {
      return NextResponse.json(
        { error: 'Invalid style. Must be one of: allison, ines, rita, blend' },
        { status: 400 }
      );
    }

    // Validate number of ideas
    if (numIdeas < 1 || numIdeas > 20) {
      return NextResponse.json(
        { error: 'Number of ideas must be between 1 and 20' },
        { status: 400 }
      );
    }

    console.log(`Generating ${numIdeas} ideas with style: ${style}`);

    // Load all profile data
    const profiles = loadAllProfiles();

    // Generate ideas using Claude
    const ideas = await generateIdeas(profiles, style, numIdeas);

    // Return ideas as JSON
    const response: GenerateIdeasResponse = { ideas };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating ideas:', error);

    // Check if it's a profile loading error
    if (error instanceof Error && error.message.includes('Failed to read profile')) {
      return NextResponse.json(
        {
          error: 'Profile files not found. Make sure all profile .txt files are in the data/ directory.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          error: 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.local',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Failed to generate ideas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
