import request from 'supertest';
import app from './app.js';

describe('GET /streamChatCompletion', () => {
  it('responds with valid stream format', async () => {
    const response = await request(app)
      .get('/streamChatCompletion?input=Hello')
      .expect('Content-Type', /text\/event-stream/)
      .expect(200);

    expect(response.text).toContain('data: ');
  });

  it('returns responses in the correct structure', async () => {
    const response = await request(app)
      .get('/streamChatCompletion?input=Test')
      .expect('Content-Type', /text\/event-stream/)
      .expect(200);

    const messages = response.text.trim().split('\n\n');
    expect(messages).toBeInstanceOf(Array);
    expect(messages[0]).toContain('data: ');
  });

  it('responds appropriately to a specific input', async () => {
    const specificInput = "1 + 1 =";
    const response = await request(app)
      .get(`/streamChatCompletion?input=${encodeURIComponent(specificInput)}`)
      .expect('Content-Type', /text\/event-stream/)
      .expect(200);

    const dataLines = response.text.split('\n').filter(line => line.startsWith('data: '));
    const simulatedCompleteMessage = dataLines
      .map(line => line.substring(5).trim().replace(/^"|"$/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s([?!.,])/g, '$1');

    const expectedResponseParts = ["Sure", "1 + 1 =", "2."];

    expectedResponseParts.forEach(part => {
      expect(simulatedCompleteMessage).toContain(part);
    });
  });


  it('handles server errors gracefully', async () => {
    const response = await request(app)
      .get('/streamChatCompletion?input=TriggerError')
      .expect(500);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('Error message or code');
  });

});
