const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONVERSATION_ID = '5c60082d-60d9-40f3-95ef-45ec4633a678';
const APP_DATA_DIR = process.env.APPDATA_DIR || 'C:\\Users\\agshu\\.gemini\\antigravity-ide';
const LOGS_DIR = path.join(APP_DATA_DIR, 'brain', CONVERSATION_ID, '.system_generated', 'logs');
const TRANSCRIPT_FULL = path.join(LOGS_DIR, 'transcript_full.jsonl');
const TRANSCRIPT_SLIM = path.join(LOGS_DIR, 'transcript.jsonl');
const OUTPUT_FILE = path.join(__dirname, '..', 'CHAT_HISTORY.md');

async function syncChatHistory() {
  const targetLog = fs.existsSync(TRANSCRIPT_FULL) ? TRANSCRIPT_FULL : TRANSCRIPT_SLIM;
  if (!fs.existsSync(targetLog)) {
    console.error(`Log file not found at: ${targetLog}`);
    process.exit(1);
  }

  console.log(`Reading transcript from: ${targetLog}`);
  const fileStream = fs.createReadStream(targetLog, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const turns = [];
  let currentGroup = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      const stepIndex = data.step_index;

      if (data.type === 'USER_INPUT') {
        const raw = data.content || '';
        let cleanText = '';

        const userReqMatch = raw.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        const userReq = userReqMatch ? userReqMatch[1].trim() : '';

        const preReq = raw.split('<USER_REQUEST>')[0].trim();
        const parts = [];
        if (preReq) parts.push(preReq);
        if (userReq) parts.push(userReq);
        cleanText = parts.join('\n\n') || raw.trim();

        turns.push({
          role: 'User',
          step: stepIndex,
          timestamp: data.timestamp || new Date().toISOString(),
          content: cleanText
        });
      } else if (data.type === 'PLANNER_RESPONSE') {
        const content = data.content || (data.model_response && data.model_response.content) || '';
        if (content && content.trim().length > 0) {
          turns.push({
            role: 'Assistant',
            step: stepIndex,
            timestamp: data.timestamp || new Date().toISOString(),
            content: content.trim()
          });
        }
      }
    } catch (err) {
      // Ignore malformed lines
    }
  }

  // Group and format markdown
  let md = `# 📜 KioskDrop Enterprise — Complete Conversation History\n\n`;
  md += `> **Metadata:**\n`;
  md += `> - **Conversation ID:** \`${CONVERSATION_ID}\`\n`;
  md += `> - **Workspace:** \`d:\\PROJECTS\\Ricoz Internship\\Project 1\`\n`;
  md += `> - **Last Synchronized:** ${new Date().toISOString()}\n`;
  md += `> - **Total Recorded Exchanges:** ${turns.length} entries\n\n`;
  md += `---\n\n`;

  let turnCounter = 1;
  for (let i = 0; i < turns.length; i++) {
    const entry = turns[i];
    const isUser = entry.role === 'User';
    const icon = isUser ? '👤' : '🤖';
    const title = isUser ? `Turn ${turnCounter++}: User Request` : `Assistant Response`;

    md += `### ${icon} ${title} *(Step ${entry.step})*\n\n`;
    if (entry.content) {
      md += `${entry.content}\n\n`;
    }
    md += `---\n\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, md, 'utf-8');
  console.log(`Successfully generated CHAT_HISTORY.md at: ${OUTPUT_FILE}`);
}

syncChatHistory().catch((err) => {
  console.error('Error syncing chat history:', err);
  process.exit(1);
});
