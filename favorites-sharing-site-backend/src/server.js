import express, { json } from 'express';
import cors from 'cors';
import { createClient as createRedisClient } from 'redis';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(json());

const redisClient = createRedisClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.connect();

// Sign-in/Sign-up endpoint
app.post('/api/auth/signin', async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    const redisUserKey = `user:${trimmedUsername}`;
    const userExists = await redisClient.exists(redisUserKey);

    if (userExists) {
        const userData = await redisClient.hGetAll(redisUserKey);

        return res.status(200).json({
            message: 'Sign in successful',
            user: {
                username: trimmedUsername,
                createdAt: userData.createdAt
            },
            isNewUser: false
        });
    }

    const createdAt = new Date().toISOString();
    await redisClient.hSet(redisUserKey, {
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
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
