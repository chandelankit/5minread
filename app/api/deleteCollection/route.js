import { MongoClient } from 'mongodb';

// MongoDB connection string
const url = process.env.MONGO_DB_URI; // Use your MongoDB connection string
const dbName = 'promptSearch';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = new MongoClient(url);

    try {
      await client.connect();
      const db = client.db(dbName);

      // Specify the collection to delete
      const collectionName = 'news';

      // Drop the collection
      await db.collection(collectionName).drop();
      console.log(`Collection ${collectionName} has been deleted.`);
      
      res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
