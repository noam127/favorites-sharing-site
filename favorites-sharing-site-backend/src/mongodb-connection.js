import { MongoClient } from 'mongodb';

export const MONGODB_DB_NAME = 'favorites-sharing-site';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

export const mongoClient = new MongoClient(MONGODB_URI);

/** NOTE: Returns a Db object, not a MongoClient object */
export const connectToMongoDB = async () => {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');

        return mongoClient.db(MONGODB_DB_NAME);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const getDbCollections = async (db) => {
    const users = db.collection('users');
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ publicShareToken: 1 }, { unique: true, sparse: true });

    const categories = db.collection('categories');
    await categories.createIndex({ username: 1, name: 1 }, { unique: true });
    await categories.createIndex({ username: 1 });

    const favorites = db.collection('favorites');
    await favorites.createIndex({ username: 1, categoryName: 1 });
    await favorites.createIndex({ username: 1, categoryName: 1, isPrivate: 1 });

    return { users, categories, favorites };
};
