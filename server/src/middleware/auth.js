const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ msg: 'Not authenticated' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized' });
    }
};

module.exports = {
    isAuthenticated,
    isAdmin
};
