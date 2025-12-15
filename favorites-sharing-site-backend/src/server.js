import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'favorites-sharing-site';

const app = express();
app.use(cors());
app.use(json());

const client = new MongoClient(MONGODB_URI);

let db;
let usersCollection;
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        db = client.db(DB_NAME);
        usersCollection = db.collection('users');
        await usersCollection.createIndex({ username: 1 }, { unique: true });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Sign-in/Sign-up endpoint
app.post('/api/auth/signin', async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    const user = await usersCollection.findOne({ username: trimmedUsername });

    if (user) {
        return res.status(200).json({
            message: 'Sign in successful',
            user: {
                username: user.username,
                createdAt: user.createdAt
            },
            isNewUser: false
        });
    }

    const createdAt = new Date().toISOString();
    const newUser = {
        username: trimmedUsername,
        createdAt,
    };

    await usersCollection.insertOne(newUser);

    return res.status(201).json({
        message: 'Account created successfully',
        user: {
            username: trimmedUsername,
            createdAt: createdAt
        },
        isNewUser: true
    });
});

// Start server after successfully connecting to MongoDB
connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Close MongoDB client
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await client.close();
    process.exit(0);
});
