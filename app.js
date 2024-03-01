import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));

// Initialize the Groq model with your API key
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Route definitions
app.get('/streamChatCompletion', async (req, res) => {
  const input = req.query.input || "Default input";
    // Simulate error handling for a specific input value
    if (input === 'TriggerError') {
        res.status(500).send('Error message or code');
        return; 
      }
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant"],
    ["human", input],
  ]);
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const responseStream = await chain.stream({ input });
    for await (const item of responseStream) {
      res.write(`data: ${JSON.stringify(item)}\n\n`);
    }
    res.end();
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    res.status(500).send('Error streaming chat completion');
  }
});

export default app;

