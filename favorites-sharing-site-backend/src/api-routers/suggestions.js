import express from 'express';
import requireAuth from '../authMiddleware.js';
import { generateSuggestions } from '../services/anthropic-service.js';

export const createAPISuggestionsRouter = (categoriesCollection, favoritesCollection) => {
    const router = express.Router();

    // POST /api/categories/:categoryName/suggestions - Generate suggestions for a category
    router.post('/categories/:categoryName/suggestions', requireAuth, async (req, res) => {
        const { categoryName } = req.params;
        const username = req.session.username;

        const category = await categoriesCollection.findOne({
            username,
            name: categoryName
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const favorites = await favoritesCollection
            .find({
                username,
                categoryName
            })
            .sort({ createdAt: -1 })
            .toArray();

        if (favorites.length === 0) {
            return res.status(400).json({
                error: 'Add some favorites to this category first to get suggestions'
            });
        }

        try {
            const suggestions = await generateSuggestions(categoryName, favorites);

            res.status(200).json({
                suggestions,
                categoryName,
                basedOnCount: favorites.length
            });
        } catch (serviceError) {
            if (serviceError.message === 'API_KEY_NOT_CONFIGURED') {
                return res.status(503).json({
                    error: 'Suggestions feature is not configured. Please contact support.'
                });
            } else if (serviceError.message === 'RATE_LIMIT') {
                return res.status(429).json({
                    error: 'Too many requests. Please try again in a moment.'
                });
            } else if (serviceError.message === 'SERVICE_OVERLOADED') {
                return res.status(503).json({
                    error: 'Service is temporarily busy. Please try again.'
                });
            } else if (serviceError.message === 'API_KEY_INVALID') {
                return res.status(503).json({
                    error: 'Suggestions feature configuration error. Please contact support.'
                });
            } else if (serviceError.message === 'PARSE_ERROR') {
                return res.status(500).json({
                    error: 'Unable to generate suggestions. Please try again.'
                });
            } else {
                console.error('Suggestions service error:', serviceError);
                return res.status(500).json({
                    error: 'Unable to generate suggestions. Please try again.'
                });
            }
        }
    });

    return router;
};
