# Kundra Content Generator - Web UI

A Next.js web application for generating LinkedIn content ideas and full articles using Claude AI. This tool helps create sharp, original content focused on parenthood, workplace performance, HR innovation, and leadership.

## Features

- **Idea Generation**: Generate 1-20 content ideas with different styles (Allison, Ines, Rita, or Blend)
- **Interactive Selection**: Review and select ideas with detailed metadata (style, audience, angle, hook, structure)
- **Article Expansion**: Transform selected ideas into full 600-1200 word LinkedIn posts
- **Easy Copying**: One-click copy to clipboard for immediate use
- **Real-time Feedback**: Loading states and error handling for smooth UX

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key (get one at https://console.anthropic.com/)
- Profile text files (adi.txt, allison.txt, ines.txt, rita.txt)

## Setup Instructions

### 1. Create the Next.js App

If you haven't cloned this repository, create a new Next.js app:

\`\`\`bash
npx create-next-app@latest content-ui --typescript --tailwind --app --no-src-dir
cd content-ui
\`\`\`

If you're using this existing codebase, skip to step 2.

### 2. Install Dependencies

\`\`\`bash
cd content-ui
npm install
\`\`\`

This will install:
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3
- Anthropic SDK

### 3. Add Profile Files

Create a \`data/\` directory and add your profile text files:

\`\`\`bash
mkdir -p data
\`\`\`

Then copy or create these files in the \`data/\` directory:
- \`data/adi.txt\` - Adi's profile (main creator)
- \`data/allison.txt\` - Allison's profile (inspiration)
- \`data/ines.txt\` - Ines's profile (inspiration)
- \`data/rita.txt\` - Rita's profile (inspiration)

**Option A**: Copy from Python CLI project:
\`\`\`bash
cp ../profiles/*.txt data/
\`\`\`

**Option B**: Create new files and paste content into each.

Optionally, you can also add:
- \`data/idea_prompt_system.txt\` - Custom system prompt (falls back to inline prompt if not present)

### 4. Configure API Key

Create a \`.env.local\` file in the root directory:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit \`.env.local\` and add your Anthropic API key:

\`\`\`
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
\`\`\`

**IMPORTANT**: Never commit \`.env.local\` to version control. It's already in \`.gitignore\`.

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production (Optional)

\`\`\`bash
npm run build
npm run start
\`\`\`

## How to Use

### Step 1: Generate Ideas

1. **Select a style**:
   - **Blend**: Synthesizes all inspiration profiles into Adi's voice
   - **Allison**: Founder storytelling style
   - **Ines**: Raw emotional honesty style
   - **Rita**: Business-case driven style

2. **Choose number of ideas**: 1-20 (default: 10)

3. **Click "Generate Ideas"**: Wait 10-30 seconds for Claude to generate ideas

### Step 2: Review and Select Ideas

- Browse generated ideas displayed as cards
- Each card shows:
  - Title
  - Style
  - Target audience
  - One-sentence angle
  - Hook example
  - 4-step structure (expandable)
- Click on cards or checkboxes to select ideas for article generation
- You can select as many ideas as you want (limit: 10 for article generation)

### Step 3: Generate Full Articles

1. **Click "Generate Articles (X selected)"** button
2. Wait for Claude to expand each selected idea into a full article
3. This may take 30-60 seconds per article

### Step 4: Copy and Use

- Each generated article appears in its own card below
- Click the **"Copy"** button to copy the full article text to clipboard
- Paste directly into LinkedIn or your content management system

## Project Structure

\`\`\`
content-ui/
├── app/
│   ├── api/
│   │   ├── ideas/
│   │   │   └── route.ts          # API: Generate ideas
│   │   └── articles/
│   │       └── route.ts          # API: Generate articles
│   ├── page.tsx                  # Main UI page
│   ├── layout.tsx                # App layout
│   └── globals.css               # Global styles
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── claudeClient.ts           # Claude API wrapper
│   ├── profiles.ts               # Profile file loader
│   └── ideaEngine.ts             # Idea & article generation logic
├── data/
│   ├── adi.txt                   # Adi's profile
│   ├── allison.txt               # Allison's profile
│   ├── ines.txt                  # Ines's profile
│   ├── rita.txt                  # Rita's profile
│   └── idea_prompt_system.txt    # (Optional) System prompt
├── public/                        # Static assets
├── .env.local                     # Environment variables (API key)
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind config
└── README.md                      # This file
\`\`\`

## API Endpoints

### POST /api/ideas

Generate content ideas.

**Request:**
\`\`\`json
{
  "style": "blend" | "allison" | "ines" | "rita",
  "n": 10
}
\`\`\`

**Response:**
\`\`\`json
{
  "ideas": [
    {
      "id": "idea-1",
      "title": "...",
      "style": "blend",
      "audience": "...",
      "angle": "...",
      "hookExample": "...",
      "structure": ["...", "...", "...", "..."]
    }
  ]
}
\`\`\`

### POST /api/articles

Generate full articles from ideas.

**Request:**
\`\`\`json
{
  "ideas": [
    {
      "id": "idea-1",
      "title": "...",
      "style": "blend",
      "audience": "...",
      "angle": "...",
      "hookExample": "...",
      "structure": ["..."]
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "articles": [
    {
      "ideaId": "idea-1",
      "title": "...",
      "text": "Full article text here..."
    }
  ]
}
\`\`\`

## Troubleshooting

### "Profile files not found" error

**Solution**: Make sure all 4 profile .txt files exist in the \`data/\` directory:
\`\`\`bash
ls data/
# Should show: adi.txt  allison.txt  ines.txt  rita.txt
\`\`\`

### "ANTHROPIC_API_KEY is not set" error

**Solution**: Create or update \`.env.local\` with your API key:
\`\`\`bash
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local
\`\`\`

Then restart the dev server.

### Ideas are generic or off-topic

**Solution**: The system prompt has been enhanced to generate sharp, original ideas focused on:
- Parenthood & Performance
- Parental Leave as Strategy
- HR & People Operations
- Leadership & Management
- Kundra Mission

If ideas are still generic, check that profile files contain detailed, specific information about Adi's voice and mission.

### Articles are too short or too long

**Solution**: The article generation prompt targets 600-1200 words. You can adjust this by editing the prompt in \`lib/ideaEngine.ts\` (look for \`buildArticleGenerationPrompt\` function).

## Development

### Adding New Features

- **Custom styles**: Add to \`StyleType\` in \`lib/types.ts\` and update profile loader
- **Additional metadata**: Extend \`Idea\` interface in \`lib/types.ts\`
- **Prompt customization**: Edit prompts in \`lib/ideaEngine.ts\`
- **UI enhancements**: Modify \`app/page.tsx\`

### Running Tests

\`\`\`bash
npm run lint
\`\`\`

### Building for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Cost Considerations

- **Idea generation**: ~8,000 tokens per request (10 ideas ≈ $0.06)
- **Article generation**: ~4,000 tokens per article (~$0.03 per article)
- **Model used**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

**Estimated costs**:
- 10 ideas: ~$0.06
- 3 full articles: ~$0.09
- **Total per session**: ~$0.15

Monitor your usage at https://console.anthropic.com/

## Related Projects

This web UI complements the Python CLI tool at \`../scripts/generate_ideas.py\`. Both use the same enhanced prompts and profile system.

## License

Private project - All rights reserved.

## Support

For issues or questions, contact the development team.
