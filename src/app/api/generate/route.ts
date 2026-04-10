import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ContentRequestSchema } from '@/lib/schema/post.schema';
import { LLMService } from '@/lib/services/llm.service';
import { SheetsService } from '@/lib/services/sheets.service';
import clientPromise from '@/lib/db/mongodb';

export async function POST(request: Request) {
  try {
    // SECURITY GATE: Verify active founder session
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized Dashboard Access', { status: 401 });
    }

    const rawBody = await request.json();
    
    // 1. Strict Schema Validation
    const parsedInput = ContentRequestSchema.safeParse(rawBody);
    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Validation Failed', details: parsedInput.error.issues }, { status: 400 });
    }

    const payload = parsedInput.data;

    // 2. LLM Engine Generation
    const generatedBatch = await LLMService.generatePosts(payload);

    // 3. Save to Primary Database (MongoDB) strictly requiring idempotency if we had unique jobs, but it's an insert-only queue.
    try {
      const client = await clientPromise;
      const db = client.db("anteresAI");
      const collection = db.collection("generations");

      await collection.insertOne({
        timestamp: new Date().toISOString(),
        request: payload,
        outputs: generatedBatch
      });
    } catch (dbError) {
      console.error("MongoDB Save Error (Non-blocking):", dbError);
    }

    // 4. Secondary Readable Sync (Google Sheets) via async mapping
    const summaryStr = [payload.rawThoughts, payload.domainContext].filter(Boolean).join(" | ").substring(0, 100);
    
    // We map each generated post to a row
    for (const post of generatedBatch) {
      await SheetsService.appendRow([
        new Date().toISOString(),
        post.format,
        summaryStr,
        post.body,
        post.hashtags.join(", ")
      ]);
    }

    return NextResponse.json({ success: true, count: generatedBatch.length, data: generatedBatch });
    
  } catch (error: any) {
    console.error("API Generation Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
