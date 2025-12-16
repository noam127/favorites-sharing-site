import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createRedisClient } from './redis-connection.js';
import { connectToMongoDB, getDbCollections, mongoClient } from './mongodb-connection.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Vite default dev server port
    credentials: true
}));

app.use(json());

const redisClient = createRedisClient();
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

let usersCollection;

async function initializeMongoDBCollections() {
    const db = await connectToMongoDB();
    usersCollection = (await getDbCollections(db)).users;
}

initializeMongoDBCollections();

// Sign-in/Sign-up endpoint
app.post('/api/auth/signin', async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    const userInDb = await usersCollection.findOne({ username: trimmedUsername });

    let statusCode;
    let message;
    let userInResponse;
    let isNewUser;

    if (userInDb) {
        statusCode = 200;
        message = 'Sign in successful';
        userInResponse = userInResponse = {
            username: userInDb.username,
            createdAt: userInDb.createdAt,
        };

        isNewUser = false;
    } else {
        statusCode = 201;
        message = 'Account created successfully';
        userInResponse = {
            username: trimmedUsername,
            createdAt: new Date().toISOString(),
        };

        await usersCollection.insertOne(userInResponse);

        isNewUser = true;
    }

    req.session.username = userInResponse.username;
    return res.status(statusCode).json({
        message,
        user: userInResponse,
        isNewUser,
    });
});

app.post('/api/auth/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to sign out' });
        } else {
            res.status(200).json({ message: 'Sign out successful' });
        }
    });
});

app.get('/api/auth/session', async (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ authenticated: false });
    }

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Close database clients
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoClient.close();
    await redisClient.quit();
    process.exit(0);
});
