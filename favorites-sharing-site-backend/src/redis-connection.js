import { createClient } from 'redis';

export const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

export const createRedisClient = () => {
    const redisClient = createClient({ url: REDIS_URI });

    redisClient.on('error', (err) => console.error('Redis connection error:', err));
    redisClient.on('connect', () => console.log('Connected to Redis'));
    redisClient.connect();

    return redisClient;
};
