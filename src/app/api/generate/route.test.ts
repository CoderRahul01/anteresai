import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { LLMService } from '@/lib/services/llm.service';

// Mock the heavy backend services precisely so we test the integration boundary safely 
vi.mock('@/lib/services/llm.service', () => ({
  LLMService: {
    generatePosts: vi.fn(),
  }
}));

vi.mock('@/lib/db/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({ insertOne: vi.fn() })
    })
  })
}));

vi.mock('@/lib/services/sheets.service', () => ({
  SheetsService: {
    appendRow: vi.fn()
  }
}));

describe('Integration Test: API Generation Route', () => {
  
  it('should return 400 Bad Request if missing critical schemas', async () => {
    const rawRequest = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({}), // Empty Request
    });

    const response = await POST(rawRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Validation Failed');
  });

  it('should execute 200 Integration Sync successfully on valid input', async () => {
    // Stage mock data payload
    const mockOutput = [
      { format: 'Founder Reality', body: 'Test', hashtags: [], editorsNote: 'Note' },
      { format: 'Industry Tension', body: 'Test', hashtags: [], editorsNote: 'Note' },
      { format: 'Builder\\'s Breakdown', body: 'Test', hashtags: [], editorsNote: 'Note' },
      { format: 'Contrarian Signal', body: 'Test', hashtags: [], editorsNote: 'Note' },
      { format: 'The Long Game', body: 'Test', hashtags: [], editorsNote: 'Note' }
    ];

    (LLMService.generatePosts as any).mockResolvedValue(mockOutput);

    const validRequest = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ rawThoughts: 'Running an integration test.' }),
    });

    const response = await POST(validRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(5);
  });
});
