import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
const DB_NAME = 'favorites-sharing-site';

const app = express();

// CORS configuration - must allow credentials for sessions
app.use(cors({
    origin: 'http://localhost:5173', // Vite default dev server port
    credentials: true
}));

app.use(json());

const redisClient = createClient({ url: REDIS_URI });
redisClient.on('error', (err) => console.error('Redis connection error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.connect();

const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
});

app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
}));

const mongoClient = new MongoClient(MONGODB_URI);

let db;
let usersCollection;

async function connectToMongoDB() {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');

        db = mongoClient.db(DB_NAME);
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
        // Store username in session
        req.session.username = user.username;

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

    // Store username in session
    req.session.username = trimmedUsername;

    return res.status(201).json({
        message: 'Account created successfully',
        user: {
            username: trimmedUsername,
            createdAt: createdAt
        },
        isNewUser: true
    });
});

// Sign-out endpoint
app.post('/api/auth/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to sign out' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.status(200).json({ message: 'Sign out successful' });
    });
});

// Check current session endpoint
app.get('/api/auth/session', async (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ authenticated: false });
    }

    // Retrieve user details from MongoDB
    const user = await usersCollection.findOne({ username: req.session.username });

    if (!user) {
        // Session exists but user doesn't exist in database
        req.session.destroy();
        return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
        authenticated: true,
        user: {
            username: user.username,
            createdAt: user.createdAt
        }
    });
});

// Start server after successfully connecting to databases
async function startServer() {
    await connectToMongoDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();

// Close database clients
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoClient.close();
    await redisClient.quit();
    process.exit(0);
});
