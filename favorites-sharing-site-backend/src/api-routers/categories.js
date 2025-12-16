import crypto from 'crypto';
import express from 'express';
import requireAuth from '../authMiddleware.js';

// Token generator for public share links
const generateShareToken = () => crypto.randomBytes(8).toString('hex');

export const createAPICategoriesRouter = (categoriesCollection, favoritesCollection) => {
    const router = express.Router();

    // GET /api/categories - List user's categories
    router.get('/', requireAuth, async (req, res) => {
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
    router.post('/', requireAuth, async (req, res) => {
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
    router.delete('/:categoryName', requireAuth, async (req, res) => {
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
    router.patch('/:categoryName/regenerate-token', requireAuth, async (req, res) => {
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

    return router;
};
