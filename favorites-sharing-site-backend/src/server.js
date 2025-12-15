const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client setup
const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
redisClient.connect();

const signinImpl = async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();

    // Check if user exists in Redis
    const userExists = await redisClient.exists(`user:${trimmedUsername}`);

    if (userExists) {
        // User exists, sign them in
        const userData = await redisClient.hGetAll(`user:${trimmedUsername}`);
        return res.status(200).json({
            message: 'Sign in successful',
            user: {
                username: trimmedUsername,
                createdAt: userData.createdAt
            },
            isNewUser: false
        });
    } else {
        // User doesn't exist, create new account
        const createdAt = new Date().toISOString();
        await redisClient.hSet(`user:${trimmedUsername}`, {
            username: trimmedUsername,
            createdAt: createdAt
        });

        return res.status(201).json({
            message: 'Account created successfully',
            user: {
                username: trimmedUsername,
                createdAt: createdAt
            },
            isNewUser: true
        });
    }
};

// Sign-in/Sign-up endpoint
app.post('/api/auth/signin', async (req, res) => {
    try {
        signinImpl(req, res);
    } catch (error) {
        console.error('Error in sign-in endpoint:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
