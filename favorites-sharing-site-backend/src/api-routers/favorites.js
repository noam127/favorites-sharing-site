import express from 'express';
import requireAuth from '../authMiddleware.js';

export const createAPIFavoritesRouter = (categoriesCollection, favoritesCollection) => {
    const router = express.Router();

    // GET /api/categories/:categoryName/favorites - List favorites in a category
    router.get('/categories/:categoryName/favorites', requireAuth, async (req, res) => {
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
    router.post('/categories/:categoryName/favorites', requireAuth, async (req, res) => {
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
    router.patch('/favorites/:favoriteId', requireAuth, async (req, res) => {
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
    router.delete('/favorites/:favoriteId', requireAuth, async (req, res) => {
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

    return router;
};
