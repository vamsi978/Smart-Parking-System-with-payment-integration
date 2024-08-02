import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

//console.log(process.env.JWT_SECRET);
const secret = "ABC"
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  });

  //  HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;