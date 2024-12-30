const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send('Access denied. No token provided.');

    const token = authHeader.split(' ')[1]; // Extract the token from the "Bearer <token>" format
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};