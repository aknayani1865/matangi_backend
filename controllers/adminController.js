const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid Email'});

    // Compare plain text passwords
    if (admin.password !== password) return res.status(400).json({message:'Invalid Password'});

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};