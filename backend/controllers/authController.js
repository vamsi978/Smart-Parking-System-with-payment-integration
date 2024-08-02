import dotenv from 'dotenv'
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { promisify } from 'util';
import jwt, { decode } from 'jsonwebtoken';
import  { authentiticatonDBConnection as db}from '../config/db.js'
import bcrypt from 'bcryptjs';
const { compare, genSalt, hash } = bcrypt;
const genSaltAsync = promisify(genSalt);
const hashAsync = promisify(hash);
import cors from 'cors';
import nodemailer from 'nodemailer'
dotenv.config()
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});
const keysecret = process.env.JWT_SECRET
console.log(keysecret);

// @desc    Auth user & get token
// @route   POST /api/admin/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results, fields] = await db.promise().query(query, [email]);
  
    if (results && results.length > 0) {
      const { _id, user_name, email, password_hash } = results[0];
      const user = { _id, user_name, email };
      //console.log(results[0]);
      //Password match check
      const passwordMatch = await bcrypt.compare(password, password_hash);
      
      if (passwordMatch) { // valid user
        
        generateToken(res, _id);
        return res.status(200).json({
          _id: user._id,
          name: user.user_name,
          email: user.email,
        });
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      return res.status(401).json({ message: "User account doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    Register a new user
// @route   POST /api/admin/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
   try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results, fields] = await db.promise().query(query, [email]);
  
    if (results && results.length > 0) {
       res.status(400);
       throw new Error('User already exists');
    } 
    
    const encryptedPassword = await encryptPassword(password);

    const [result, field] = await db.promise().query(
      'INSERT INTO users (user_name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, encryptedPassword]
    );
   
     //const [rows, fields, error] = await db.query('SELECT * FROM users');
    const [newUser, newFields] = await db.promise().query(query, [email])
    if(newUser && newUser.length>0){
      const {_id, user_name, email} = newUser[0]
      generateToken(res, _id);
      res.status(201).json({
        id : _id,
        name : user_name,
        email : email,
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send({message: err.message});
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/admin/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


// @desc    //send reset password link
// @route   POST /api/admin/forgot-password
// @access  Public
const sendPasswordLink = asyncHandler(async (req, res) => {
  const { email , baseUrl} = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results, fields] = await db.promise().query(query, [email]);
    console.log(results)

    if (results == null || results.length < 1) {
      res.status(401).json({ status: 401, message: "Invalid user" });
    }
    const userId = results[0]._id;
    // token generate for reset password
    const token = jwt.sign({ _id: userId }, keysecret, {
      expiresIn: "1300s",
    });

    const expirationTime = new Date(Date.now() + 2 * 60 * 1000);
    const updateQuery =
      "UPDATE users SET token = ?, expiration_time = ? WHERE _id = ?";
    const [updateResults, updateFields] = await db
      .promise()
      .query(updateQuery, [token, expirationTime, userId]);
     const url = `${baseUrl}/reset-password/${userId}/${token}`
     console.log("FULL URL "+ url);

    if (updateResults) {
      const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
         text: `This Link Valid For 2 MINUTES.  ${baseUrl}/reset-password/${userId}/${token}`,
  
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res
            .status(401)
            .json({ status: 401, message: "Email not sent" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent successfully" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: 401, message: "Invalid user" });
  }
});


//veridy token
const forgotPassword = asyncHandler(async (req, res) => {
  const {id,token} = req.params;
  try {
    const query = 'SELECT * FROM users WHERE _id = ? and token=?';
    const [results, fields] = await db.promise().query(query, [id, token]);
    if( results.length < 1){
      res.status(401).json({status:401,message:"invalid user"});
    }
      const verifyToken = jwt.verify(token,keysecret);

      // console.log(verifyToken)
      console.log(results);
      if(results  && verifyToken._id){
        console.log("HERE1");
          res.status(201).json({status:201})
      }else{
        console.log("HERE2");
          res.status(401).json({status:401,message:"user not exist"})
      }

  } catch (error) {
    console.log(error);
    console.log("HERE3");
      res.status(401).json({status:401,error})
  }
});


//send reset password link
const updatePassword = asyncHandler(async (req, res) => {
  console.log("NEW PW");
  const {id,token} = req.params;

  const {password} = req.body;

  try {
    const query = 'SELECT * FROM users WHERE _id = ? and token=?';
    const [results, fields] = await db.promise().query(query, [id, token]);
         
      const verifyToken = jwt.verify(token,keysecret);

      if(results && verifyToken._id){
          const newpassword = await encryptPassword(password);
          // console.log("PW " + password);
          // console.log("NEWPW " + newpassword);
          const updateQuery = "UPDATE users SET password_hash= ? WHERE _id = ?"
          const [updateResults, updateFields] = await db.promise().query(updateQuery, [ newpassword, id]);
          res.status(201).json({status:201, message:updateResults[0]})

      }else{
          res.status(401).json({status:401,message:"user not exist"})
      }
  } catch (error) {
      res.status(401).json({status:401,error})
  }
});

const encryptPassword = async (password) => {
  const salt = await genSaltAsync(10);
  return hashAsync(password, salt);
};


export {
  authUser,
  registerUser,
  logoutUser,
   forgotPassword,
  sendPasswordLink, 
  updatePassword
};