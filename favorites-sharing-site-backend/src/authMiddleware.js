const requireAuth = (req, res, next) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};

export default requireAuth;
