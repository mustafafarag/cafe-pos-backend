const { sign, verify } = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const signToken = (payload) => sign(payload, JWT_SECRET, { expiresIn: '3d' });

const verifyToken = (token) => verify(token, JWT_SECRET);


module.exports = {  signToken, verifyToken }