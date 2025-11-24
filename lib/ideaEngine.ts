/**
 * Idea Generation Engine
 *
 * This module contains the core logic for generating content ideas and
 * expanding them into full articles using Claude.
 */

import { Idea, StyleType, ProfileData } from './types';
import { callClaude } from './claudeClient';
import { getSystemPrompt } from './profiles';

/**
 * Build the user prompt for idea generation.
 *
 * @param profiles - All profile data (Adi + inspiration profiles)
 * @param style - Which style to use for generation
 * @param numIdeas - Number of ideas to generate
 * @returns Formatted prompt string
 */
function buildIdeaGenerationPrompt(
  profiles: ProfileData,
  style: StyleType,
  numIdeas: number
): string {
  // Define style-specific instructions
  const styleInstructions: Record<StyleType, string> = {
    blend:
      'Synthesize multiple inspiration styles into a cohesive Adi-authentic voice that feels natural and mission-driven.',
    allison:
      'Emphasize founder storytelling, vulnerability through triumph, and "here\'s what I learned building this" angles.',
    ines:
      'Focus on raw emotional honesty, unfiltered personal experience, and "here\'s the truth nobody talks about" revelations.',
    rita:
      'Prioritize business-case driven content, data and ROI focus, and "here\'s why this matters to your bottom line" arguments.',
  };

  // Build inspiration section based on style
  let inspirationSection = '';
  if (style !== 'blend') {
    // Single inspiration profile
    const inspirationText = profiles[style as keyof ProfileData];
    inspirationSection = `

---

## INSPIRATION PROFILE (${style.toUpperCase()})

Use this profile as reference for style and approach:

${inspirationText}

**STYLE GUIDANCE**: ${styleInstructions[style]}

**CRITICAL**: Always filter inspiration through Adi's authentic voice. If an inspiration idea doesn't align with Adi's mission (parenthood, performance, HR, leadership, Kundra), transform it or skip it.

---
`;
  } else {
    // Blend all inspiration profiles
    inspirationSection = `

---

## INSPIRATION PROFILES

Use these profiles as reference for style and approach, following the 'blend' strategy:

### Allison's Profile:
${profiles.allison}

### Ines's Profile:
${profiles.ines}

### Rita's Profile:
${profiles.rita}

**STYLE GUIDANCE**: ${styleInstructions.blend}

**CRITICAL**: Always filter inspiration through Adi's authentic voice. If an inspiration idea doesn't align with Adi's mission (parenthood, performance, HR, leadership, Kundra), transform it or skip it.

---
`;
  }

  // Construct the user prompt
  return `Generate ${numIdeas} sharp, original LinkedIn content ideas for Adi.

## CREATOR PROFILE (Primary Source - This is Adi)

${profiles.adi}${inspirationSection}

## OUTPUT REQUIREMENTS

Generate EXACTLY ${numIdeas} content ideas following this STRICT markdown structure:

\`\`\`markdown
## Idea [N]: [Compelling, Specific Title]

**Style**: [Allison / Ines / Rita / Blend]
**Target Audience**: [Specific persona - be precise]
**One-Sentence Angle**: [The unique insight that makes this idea worth posting]

### Hook Example
> "[The exact opening line - make it scroll-stopping]"

### 4-Step Structure
1. **[Step Name]**: [What this section covers - one sentence]
2. **[Step Name]**: [What this section covers - one sentence]
3. **[Step Name]**: [What this section covers - one sentence]
4. **[Step Name]**: [What this section covers - one sentence]

---
\`\`\`

## QUALITY CRITERIA (Non-Negotiable)

Each idea MUST:
- ✅ Focus on parenthood, performance, HR, leadership, or Kundra mission
- ✅ Sound authentically like Adi (mission-driven, data-informed, pragmatic)
- ✅ Balance emotional resonance with business logic
- ✅ Challenge conventional thinking or reveal an uncomfortable truth
- ✅ Be specific (include names, numbers, moments, not abstractions)
- ✅ Follow the exact markdown structure above

Each idea MUST NOT:
- ❌ Use generic LinkedIn tropes ("5 tips for...", "The importance of...")
- ❌ Be obvious or something said 1000 times before
- ❌ Sound like corporate speak or HR jargon
- ❌ Stray from the core topics (no generic parenting or productivity content)

## FINAL INSTRUCTION

Before generating, remind yourself: "Would Adi actually post this? Does it challenge conventional thinking? Does it serve the Kundra mission?"

Generate ${numIdeas} ideas now, using strict markdown formatting.`;
}

/**
 * Parse Claude's markdown response into structured Idea objects.
 *
 * @param rawResponse - Raw markdown text from Claude
 * @returns Array of parsed Idea objects
 */
function parseIdeasFromMarkdown(rawResponse: string): Idea[] {
  const ideas: Idea[] = [];

  // Split by "## Idea" to get individual ideas
  const ideaSections = rawResponse.split(/##\s+Idea\s+\d+:/);

  // Skip the first split (before first idea)
  for (let i = 1; i < ideaSections.length; i++) {
    const section = ideaSections[i].trim();

    try {
      // Extract title (first line)
      const lines = section.split('\n');
      const title = lines[0].trim();

      // Extract metadata using regex
      const styleMatch = section.match(/\*\*Style\*\*:\s*(.+)/i);
      const audienceMatch = section.match(/\*\*Target Audience\*\*:\s*(.+)/i);
      const angleMatch = section.match(/\*\*One-Sentence Angle\*\*:\s*(.+)/i);

      // Extract hook (text after "### Hook Example" and before next section)
      const hookMatch = section.match(
        /###\s*Hook Example\s*\n\s*>\s*"?(.+?)"?\s*(?=###|$)/is
      );

      // Extract structure steps
      const structureMatch = section.match(
        /###\s*4-Step Structure\s*\n([\s\S]+?)(?=---|$)/i
      );
      const structure: string[] = [];

      if (structureMatch) {
        const structureText = structureMatch[1];
        const stepMatches = structureText.matchAll(
          /\d+\.\s*\*\*(.+?)\*\*:\s*(.+?)(?=\n\d+\.|\n*$)/gs
        );
        for (const match of stepMatches) {
          structure.push(`**${match[1]}**: ${match[2].trim()}`);
        }
      }

      // Determine style - normalize to lowercase
      let parsedStyle: StyleType = 'blend';
      if (styleMatch) {
        const styleStr = styleMatch[1].toLowerCase();
        if (styleStr.includes('allison')) parsedStyle = 'allison';
        else if (styleStr.includes('ines')) parsedStyle = 'ines';
        else if (styleStr.includes('rita')) parsedStyle = 'rita';
        else parsedStyle = 'blend';
      }

      ideas.push({
        id: `idea-${i}`,
        title: title,
        style: parsedStyle,
        audience: audienceMatch ? audienceMatch[1].trim() : 'General audience',
        angle: angleMatch ? angleMatch[1].trim() : '',
        hookExample: hookMatch ? hookMatch[1].trim() : '',
        structure: structure.length > 0 ? structure : ['No structure provided'],
      });
    } catch (error) {
      console.error(`Error parsing idea ${i}:`, error);
      // Continue to next idea
    }
  }

  return ideas;
}

/**
 * Generate content ideas based on profile and style.
 *
 * @param profiles - All profile data
 * @param style - Which style to use
 * @param numIdeas - Number of ideas to generate
 * @returns Array of generated Idea objects
 */
export async function generateIdeas(
  profiles: ProfileData,
  style: StyleType,
  numIdeas: number
): Promise<Idea[]> {
  // Get system prompt
  const systemPrompt = getSystemPrompt();

  // Build user prompt
  const userPrompt = buildIdeaGenerationPrompt(profiles, style, numIdeas);

  // Call Claude API
  const response = await callClaude(systemPrompt, userPrompt);

  // Parse response into structured ideas
  const ideas = parseIdeasFromMarkdown(response);

  return ideas;
}

/**
 * Build the prompt for generating a full article from an idea.
 *
 * @param idea - The idea to expand
 * @param profileText - Adi's profile text for voice reference
 * @param inspirationText - Optional inspiration profile text
 * @returns Formatted prompt string
 */
function buildArticleGenerationPrompt(
  idea: Idea,
  profileText: string,
  inspirationText: string
): string {
  return `Generate a full LinkedIn post (600-1200 words) based on the following content idea.

## CREATOR PROFILE (Adi - Primary Voice Reference)

${profileText}

## INSPIRATION CONTEXT (Optional - for style reference only)

${inspirationText}

## IDEA TO EXPAND

**Title**: ${idea.title}
**Style**: ${idea.style}
**Target Audience**: ${idea.audience}
**Core Angle**: ${idea.angle}
**Hook Example**: ${idea.hookExample}

**Suggested Structure**:
${idea.structure.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ARTICLE REQUIREMENTS

Write a complete LinkedIn post that:

### Voice & Tone
- Sounds authentically like Adi (mission-driven, data-informed, personally invested)
- Balances emotional storytelling with business logic
- Challenges conventional thinking without being preachy
- Uses specific examples, numbers, and moments (not abstractions)
- Maintains professional yet personal tone suitable for LinkedIn

### Content Structure
- **Hook** (1-2 sentences): Grab attention immediately with the hook or a variation of it
- **Setup** (2-3 paragraphs): Establish the problem, tension, or observation
- **Core Content** (3-5 paragraphs): Follow the 4-step structure provided, expanding each step with specific details, examples, data, or stories
- **Conclusion** (1-2 paragraphs): Synthesize the key insight and implications
- **Call-to-Action**: End with a thought-provoking question or invitation for engagement

### Quality Standards
- Length: 600-1200 words
- NO corporate jargon or generic LinkedIn-speak
- NO obvious advice or recycled wisdom
- YES to specific stories, concrete examples, surprising data
- YES to vulnerability balanced with authority
- Focus on: parenthood, performance, HR, leadership, or Kundra mission

### Formatting
- Use short paragraphs (2-3 sentences max)
- Break up long sections with line breaks
- Use bold for emphasis on key phrases (sparingly)
- NO bullet lists (LinkedIn post style, not article style)
- NO emojis unless they're part of Adi's natural voice

## OUTPUT FORMAT

Return ONLY the article text, ready to post on LinkedIn. Do not include any meta-commentary, titles, or explanations - just the post content itself.

Start with the hook and end with the call-to-action. Make it compelling, authentic, and shareable.`;
}

/**
 * Generate a full article from a single idea.
 *
 * @param idea - The idea to expand
 * @param profiles - All profile data for context
 * @returns Generated article text
 */
export async function generateArticleFromIdea(
  idea: Idea,
  profiles: ProfileData
): Promise<string> {
  // Prepare inspiration text based on the idea's style
  let inspirationText = '';
  if (idea.style !== 'blend') {
    inspirationText = profiles[idea.style as keyof ProfileData];
  } else {
    inspirationText = `### Allison's Style:\n${profiles.allison}\n\n### Ines's Style:\n${profiles.ines}\n\n### Rita's Style:\n${profiles.rita}`;
  }

  // Build prompt
  const prompt = buildArticleGenerationPrompt(
    idea,
    profiles.adi,
    inspirationText
  );

  // Use a simpler system prompt for article generation
  const systemPrompt = `You are an expert LinkedIn content writer specializing in parenthood, workplace performance, HR innovation, and leadership. You write in Adi's authentic voice - mission-driven, data-informed, personally invested, and pragmatically optimistic. Your writing challenges conventional thinking while remaining professional and relatable.`;

  // Call Claude API with higher token limit for full article
  const article = await callClaude(systemPrompt, prompt, 'claude-sonnet-4-5-20250929', 4000);

  return article;
}
