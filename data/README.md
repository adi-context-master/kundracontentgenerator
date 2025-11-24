# Profile Data Directory

This directory should contain the following profile text files:

## Required Files

- **adi.txt** - Adi's profile (main creator)
  - Contains Adi's background, expertise, voice, and mission
  - Example: LinkedIn "About" section, sample posts, bio

- **allison.txt** - Allison's profile (inspiration)
  - Founder storytelling style
  - Vulnerability through triumph approach

- **ines.txt** - Ines's profile (inspiration)
  - Raw emotional honesty style
  - Unfiltered personal experience

- **rita.txt** - Rita's profile (inspiration)
  - Business-case driven style
  - Data and ROI focused approach

## Optional Files

- **idea_prompt_system.txt** - Custom system prompt
  - If not present, falls back to inline prompt
  - Can be copied from \`../prompts/idea_prompt_system.txt\` in the Python CLI project

## How to Add Files

### Option 1: Copy from Python CLI project

\`\`\`bash
cp ../profiles/*.txt .
cp ../prompts/idea_prompt_system.txt .
\`\`\`

### Option 2: Create files manually

Create each file and paste the profile content:

\`\`\`bash
touch adi.txt allison.txt ines.txt rita.txt
\`\`\`

Then edit each file with your text editor.

## File Format

- Plain text files (.txt)
- UTF-8 encoding
- Can include:
  - Bio/background
  - Sample posts
  - Voice and tone guidelines
  - Key themes and topics
  - Example content

## Note

These files are read server-side only and are not exposed to the client. Keep sensitive information appropriate for server-side processing only.
