import express from 'express';
import { request } from 'http'; // or 'https' if your endpoint is secured
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.static('public'));

app.get('/streamChatCompletion', (req, res) => {
  const input = req.query.input || "Default input";

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const requestOptions = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Make the HTTP request to the Ollama API
  const apiRequest = request(requestOptions, apiResponse => {
    apiResponse.on('data', chunk => {
      // Stream each chunk of data as it arrives
      res.write(`data: ${chunk.toString()}\n\n`);
    });

    apiResponse.on('end', () => {
      res.end(); // Close the SSE connection once the API response ends
    });
  });

  apiRequest.on('error', error => {
    console.error('Error making API request:', error);
    res.status(500).send('Error streaming chat completion');
  });

  // Send the request body
  apiRequest.write(JSON.stringify({ model: "llama2", prompt: input }));
  apiRequest.end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
