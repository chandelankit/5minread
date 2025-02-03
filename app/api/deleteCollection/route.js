import { MongoClient } from 'mongodb';

// MongoDB connection string
const url = process.env.MONGO_DB_URI;
const dbName = 'promptSearch';

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

    return Response.json({ message: 'Collection deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return Response.json({ error: 'Failed to delete collection' }, { status: 500 });
  } finally {
    await client.close();
  }
}
