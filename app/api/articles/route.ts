/**
 * API Route: /api/articles
 *
 * POST endpoint that generates full articles from selected ideas.
 *
 * Request body:
 * {
 *   "ideas": Idea[]
 * }
 *
 * Response:
 * {
 *   "articles": Array<{ ideaId: string, title: string, text: string }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadAllProfiles } from '@/lib/profiles';
import { generateArticleFromIdea } from '@/lib/ideaEngine';
import {
  GenerateArticlesRequest,
  GenerateArticlesResponse,
  GeneratedArticle,
  Idea,
} from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateArticlesRequest = await request.json();

    // Validate inputs
    if (!body.ideas || !Array.isArray(body.ideas) || body.ideas.length === 0) {
      return NextResponse.json(
        { error: 'Must provide at least one idea in the ideas array' },
        { status: 400 }
      );
    }

    // Limit number of articles to prevent timeout/cost issues
    if (body.ideas.length > 10) {
      return NextResponse.json(
        { error: 'Cannot generate more than 10 articles at once' },
        { status: 400 }
      );
    }

    console.log(`Generating ${body.ideas.length} articles...`);

    // Load all profile data (needed for context in article generation)
    const profiles = loadAllProfiles();

    // Generate articles for each idea
    // Process sequentially to avoid rate limits and manage costs
    const articles: GeneratedArticle[] = [];

    for (const idea of body.ideas) {
      console.log(`Generating article for: ${idea.title}`);

      try {
        const articleText = await generateArticleFromIdea(idea, profiles);

        articles.push({
          ideaId: idea.id,
          title: idea.title,
          text: articleText,
        });

        console.log(`✓ Generated article for: ${idea.title}`);
      } catch (error) {
        console.error(`Failed to generate article for "${idea.title}":`, error);

        // Add error placeholder for this article
        articles.push({
          ideaId: idea.id,
          title: idea.title,
          text: `Error generating article: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }

    // Return generated articles
    const response: GenerateArticlesResponse = { articles };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating articles:', error);

    // Check for common errors
    if (error instanceof Error && error.message.includes('Failed to read profile')) {
      return NextResponse.json(
        {
          error: 'Profile files not found. Make sure all profile .txt files are in the data/ directory.',
          details: error.message,
        },
        { status: 500 }
      );
    }

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
        error: 'Failed to generate articles',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
