import jwt, { decode } from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import {authentiticatonDBConnection as db} from '../config/db.js'

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
   let token;

  // // Read JWT from the 'jwt' cookie
   token = req.cookies.jwt;
    console.log(req.cookies);
   if (token) {
    try {
      const decoded = jwt.verify(token, "ABC");
      console.log(decoded)
      const query = 'SELECT * FROM users WHERE _id = ?'
      const [rows] =  await db.promise().query(query, [decoded.userId]);
      // console.log(rows[0]);
      if (rows && rows.length > 0) {
        req.user = rows[0];
        next();
      } else {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  // if (req.user && req.user.isAdmin) {
     next();
  // } else {
  //   res.status(401);
  //   throw new Error('Not authorized as an admin');
  // }
};

export { protect, admin };