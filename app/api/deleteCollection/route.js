import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

// MongoDB connection string
const url = process.env.MONGO_DB_URI;
const dbName = 'promptSearch';

// Disable caching (ensure it's always fresh)
export const revalidate = 0;

export async function GET(req) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Specify the collection to delete
    const collectionName = 'news';

    // Drop the collection
    await db.collection(collectionName).drop();
    console.log(`Collection ${collectionName} has been deleted.`);

    // Return success message
    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  } finally {
    await client.close();
  }
}
