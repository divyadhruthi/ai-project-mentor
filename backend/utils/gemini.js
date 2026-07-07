const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(projectContext, userQuestion) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an AI Project Mentor. You help developers understand software projects.

Here is the project code/structure that was uploaded:

${projectContext}

Based ONLY on the above project content, answer the following question helpfully and clearly.
If the answer cannot be determined from the project content, say so.

Question: ${userQuestion}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error.message);
    if (error.message.includes('429') || error.message.includes('quota')) {
      return `Sorry, the AI service has reached its daily usage limit. Please try again tomorrow when the quota resets.\n\nIn the meantime, you can still view your uploaded files and project summary.`;
    }
    return `I'm currently unable to process your question. Please try again in a few minutes.`;
  }
}

async function generateSummary(projectContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an AI Project Mentor. Analyze the following project code/structure and provide:
1. A brief summary of what this project does
2. The tech stack used
3. Key features you can identify
4. A brief folder structure explanation

Project content:
${projectContext}

Provide a clear, well-structured response in markdown format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini summary error:', error.message);
    return generateBasicSummary(projectContext);
  }
}

function generateBasicSummary(projectContext) {
  const files = projectContext.split('--- File:').filter(f => f.trim());
  const fileNames = files.map(f => f.split('---')[0].trim());
  
  let techStack = [];
  if (projectContext.includes('express')) techStack.push('Express.js');
  if (projectContext.includes('react')) techStack.push('React');
  if (projectContext.includes('mongoose') || projectContext.includes('mongodb')) techStack.push('MongoDB');
  if (projectContext.includes('django')) techStack.push('Django');
  if (projectContext.includes('flask')) techStack.push('Flask');
  if (projectContext.includes('node') || projectContext.includes('require(')) techStack.push('Node.js');

  return `## Project Summary (Auto-generated)

**Files uploaded:** ${files.length} files

**Detected tech stack:** ${techStack.length > 0 ? techStack.join(', ') : 'Not detected'}

**Files in project:**
${fileNames.map(f => '- ' + f).join('\n')}

> Note: AI-powered detailed analysis is temporarily unavailable due to API rate limits. The AI chat will work once limits reset. You can still view your uploaded files and ask questions later.`;
}

module.exports = { askGemini, generateSummary };
