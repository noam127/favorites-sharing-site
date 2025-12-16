import express, { json } from 'express';
import cors from 'cors';
import session from 'express-session';
import crypto from 'crypto';
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
let categoriesCollection;
let favoritesCollection;

async function initializeMongoDBCollections() {
    const db = await connectToMongoDB();
    const collections = await getDbCollections(db);
    usersCollection = collections.users;
    categoriesCollection = collections.categories;
    favoritesCollection = collections.favorites;
}

initializeMongoDBCollections();

// Auth middleware
const requireAuth = (req, res, next) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Token generator for public share links
function generateShareToken() {
    return crypto.randomBytes(8).toString('hex'); // 16 character hex string
}

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

// ============= CATEGORY ENDPOINTS =============

// GET /api/categories - List user's categories
app.get('/api/categories', requireAuth, async (req, res) => {
    try {
        const username = req.session.username;
        const categories = await categoriesCollection
            .find({ username })
            .sort({ createdAt: -1 })
            .toArray();

        // Get favorite counts for each category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const favoriteCount = await favoritesCollection.countDocuments({
                    username,
                    categoryName: category.name
                });
                return {
                    _id: category._id,
                    name: category.name,
                    createdAt: category.createdAt,
                    publicShareToken: category.publicShareToken,
                    favoriteCount
                };
            })
        );

        res.status(200).json({ categories: categoriesWithCounts });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/categories - Create new category
app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        const username = req.session.username;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 50) {
            return res.status(400).json({ error: 'Category name must be 50 characters or less' });
        }

        const newCategory = {
            username,
            name: trimmedName,
            publicShareToken: generateShareToken(),
            createdAt: new Date().toISOString()
        };

        await categoriesCollection.insertOne(newCategory);

        res.status(201).json({
            message: 'Category created successfully',
            category: {
                _id: newCategory._id,
                name: newCategory.name,
                createdAt: newCategory.createdAt,
                publicShareToken: newCategory.publicShareToken,
                favoriteCount: 0
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (unique index violation)
            return res.status(400).json({ error: 'A category with this name already exists' });
        }
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/categories/:categoryName - Delete category and cascade delete favorites
app.delete('/api/categories/:categoryName', requireAuth, async (req, res) => {
    try {
        const { categoryName } = req.params;
        const username = req.session.username;

        const category = await categoriesCollection.findOne({ username, name: categoryName });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete all favorites in this category
        const favoritesResult = await favoritesCollection.deleteMany({
            username,
            categoryName
        });

        // Delete the category
        await categoriesCollection.deleteOne({ _id: category._id });

        res.status(200).json({
            message: `Category and ${favoritesResult.deletedCount} favorite(s) deleted successfully`,
            deletedFavorites: favoritesResult.deletedCount
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/categories/:categoryName/regenerate-token - Regenerate public share token
app.patch('/api/categories/:categoryName/regenerate-token', requireAuth, async (req, res) => {
    try {
        const { categoryName } = req.params;
        const username = req.session.username;

        const category = await categoriesCollection.findOne({ username, name: categoryName });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const newToken = generateShareToken();

        await categoriesCollection.updateOne(
            { _id: category._id },
            { $set: { publicShareToken: newToken } }
        );

        res.status(200).json({
            message: 'Share token regenerated successfully',
            publicShareToken: newToken
        });
    } catch (error) {
        console.error('Error regenerating token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============= FAVORITES ENDPOINTS =============

// GET /api/categories/:categoryName/favorites - List favorites in a category
app.get('/api/categories/:categoryName/favorites', requireAuth, async (req, res) => {
    try {
        const { categoryName } = req.params;
        const username = req.session.username;

        // Verify category exists and belongs to user
        const category = await categoriesCollection.findOne({ username, name: categoryName });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const favorites = await favoritesCollection
            .find({ username, categoryName })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({ favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/categories/:categoryName/favorites - Add a new favorite
app.post('/api/categories/:categoryName/favorites', requireAuth, async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { title, isPrivate } = req.body;
        const username = req.session.username;

        // Verify category exists and belongs to user
        const category = await categoriesCollection.findOne({ username, name: categoryName });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ error: 'Favorite title is required' });
        }

        const trimmedTitle = title.trim();
        if (trimmedTitle.length > 200) {
            return res.status(400).json({ error: 'Favorite title must be 200 characters or less' });
        }

        const newFavorite = {
            username,
            categoryName,
            title: trimmedTitle,
            isPrivate: isPrivate === true, // Default to false if not provided
            createdAt: new Date().toISOString()
        };

        await favoritesCollection.insertOne(newFavorite);

        res.status(201).json({
            message: 'Favorite added successfully',
            favorite: newFavorite
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/favorites/:favoriteId - Update a favorite
app.patch('/api/favorites/:favoriteId', requireAuth, async (req, res) => {
    try {
        const { favoriteId } = req.params;
        const { title, isPrivate } = req.body;
        const username = req.session.username;

        const { ObjectId } = await import('mongodb');
        const favorite = await favoritesCollection.findOne({
            _id: new ObjectId(favoriteId),
            username
        });

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ error: 'Favorite title cannot be empty' });
            }
            const trimmedTitle = title.trim();
            if (trimmedTitle.length > 200) {
                return res.status(400).json({ error: 'Favorite title must be 200 characters or less' });
            }
            updates.title = trimmedTitle;
        }

        if (isPrivate !== undefined) {
            updates.isPrivate = isPrivate === true;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        await favoritesCollection.updateOne(
            { _id: new ObjectId(favoriteId) },
            { $set: updates }
        );

        const updatedFavorite = await favoritesCollection.findOne({ _id: new ObjectId(favoriteId) });

        res.status(200).json({
            message: 'Favorite updated successfully',
            favorite: updatedFavorite
        });
    } catch (error) {
        console.error('Error updating favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/favorites/:favoriteId - Delete a favorite
app.delete('/api/favorites/:favoriteId', requireAuth, async (req, res) => {
    try {
        const { favoriteId } = req.params;
        const username = req.session.username;

        const { ObjectId } = await import('mongodb');
        const favorite = await favoritesCollection.findOne({
            _id: new ObjectId(favoriteId),
            username
        });

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        await favoritesCollection.deleteOne({ _id: new ObjectId(favoriteId) });

        res.status(200).json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============= PUBLIC ENDPOINT =============

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
