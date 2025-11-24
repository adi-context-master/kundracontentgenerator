# Quick Setup Guide

Follow these steps to get the Content UI running:

## 1. Install Dependencies

\`\`\`bash
cd content-ui
npm install
\`\`\`

## 2. Set API Key

Create \`.env.local\`:

\`\`\`bash
echo "ANTHROPIC_API_KEY=your-actual-api-key-here" > .env.local
\`\`\`

Replace \`your-actual-api-key-here\` with your real Anthropic API key.

## 3. Verify Data Files

Check that profile files are in place:

\`\`\`bash
ls data/
# Should show: adi.txt  allison.txt  ines.txt  rita.txt  idea_prompt_system.txt  README.md
\`\`\`

If missing, copy from parent directory:

\`\`\`bash
cp ../profiles/*.txt data/
cp ../prompts/idea_prompt_system.txt data/
\`\`\`

## 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

## 5. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Done! 🎉

You should now see the Content Generator UI. Try generating some ideas!

---

## Troubleshooting

### Port 3000 is already in use

Change the port:

\`\`\`bash
PORT=3001 npm run dev
\`\`\`

### Module not found errors

Clear cache and reinstall:

\`\`\`bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
\`\`\`

### API key errors

Make sure \`.env.local\` exists and contains:

\`\`\`
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

Restart the dev server after creating/updating \`.env.local\`.
