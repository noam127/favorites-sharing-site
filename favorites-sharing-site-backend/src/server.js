import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createRedisClient } from './redis-connection.js';
import { connectToMongoDB, getDbCollections, mongoClient } from './mongodb-connection.js';
import { createAPIAuthRouter } from './api-routers/auth.js';
import { createAPICategoriesRouter } from './api-routers/categories.js';
import { createAPIFavoritesRouter } from './api-routers/favorites.js';

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
let categoriesCollection;
let favoritesCollection;

async function initializeMongoDBCollections() {
    const db = await connectToMongoDB();
    const collections = await getDbCollections(db);
    usersCollection = collections.users;
    categoriesCollection = collections.categories;
    favoritesCollection = collections.favorites;
}

initializeMongoDBCollections().then(() => {
    app.use('/api/auth', createAPIAuthRouter(usersCollection));
    app.use('/api/categories', createAPICategoriesRouter(categoriesCollection, favoritesCollection));
    app.use('/api', createAPIFavoritesRouter(categoriesCollection, favoritesCollection));
});

// GET /api/public/:token - Public view (no auth required)
app.get('/api/public/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find category by public share token
        const category = await categoriesCollection.findOne({ publicShareToken: token });

        if (!category) {
            return res.status(404).json({ error: 'Shared link not found or has been changed' });
        }

        // Get only public (non-private) favorites
        const publicFavorites = await favoritesCollection
            .find({
                username: category.username,
                categoryName: category.name,
                isPrivate: false
            })
            .sort({ createdAt: -1 })
            .toArray();

        // Return category name and public favorites (no username for privacy)
        res.status(200).json({
            category: {
                name: category.name
            },
            favorites: publicFavorites.map(fav => ({
                title: fav.title,
                createdAt: fav.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching public favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
