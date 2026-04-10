import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/db/mongodb';

export async function GET() {
  try {
    // SECURITY GATE: Verify active founder session
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('anteresAI');
    const collection = db.collection('generations');

    // Fetch last 50 generations, newest first
    const generations = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Serialize MongoDB ObjectIds to strings for JSON transport
    const serialized = generations.map((gen) => ({
      ...gen,
      _id: gen._id.toString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error('Generations Fetch Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
