import express from 'express';

export const createAPIAuthRouter = (usersCollection) => {
    const router = express.Router();

    // Sign-in/Sign-up endpoint
    router.post('/signin', async (req, res) => {
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

    router.post('/signout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'Failed to sign out' });
            } else {
                res.status(200).json({ message: 'Sign out successful' });
            }
        });
    });

    router.get('/session', async (req, res) => {
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

    return router;
};
